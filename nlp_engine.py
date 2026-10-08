"""
NLP Engine for College FAQ Chatbot (Academic Compass)
Technique: TF-IDF (Term Frequency - Inverse Document Frequency) + Cosine Similarity

Designed to be mathematically clear, beginner-friendly, and easy to explain during Viva.
"""

import re
import string
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class FAQMatcher:
    """
    FAQ Matching Engine using TF-IDF Vectorization and Cosine Similarity.
    
    Viva Concept Highlights:
    1. Text Preprocessing: Cleans raw query (lowercase, removes punctuation).
    2. Vectorization: Converts words into numerical feature vectors based on TF-IDF.
    3. Cosine Similarity: Measures the cosine of the angle between query vector and FAQ vectors.
    4. Confidence Threshold: Determines if match is strong enough or fallback is required.
    """

    def __init__(self, faq_list, confidence_threshold=0.25):
        """
        Initialize the FAQMatcher with a list of FAQ dictionaries.
        """
        self.faq_list = faq_list
        self.confidence_threshold = confidence_threshold
        
        # Mapping structures
        self.corpus = []         # Flattened list of patterns/questions
        self.corpus_faq_map = [] # Points each pattern index back to its FAQ item index
        
        self.vectorizer = None
        self.tfidf_matrix = None
        
        self._build_index()

    @staticmethod
    def preprocess(text):
        """
        Text normalization for NLP:
        - Lowercases text
        - Replaces possessives like 's with space
        - Replaces punctuation with space so words like 'today's' yield 'today'
        - Strips extra spaces
        """
        if not text:
            return ""
        text = text.lower().strip()
        # Remove possessive 's
        text = re.sub(r"'s\b", " ", text)
        # Replace punctuation characters with space
        text = re.sub(r"[^\w\s]", " ", text)
        # Collapse multiple spaces
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _build_index(self):
        """
        Builds the TF-IDF representation for all FAQ questions and alternative patterns.
        """
        self.corpus = []
        self.corpus_faq_map = []

        for faq_idx, faq in enumerate(self.faq_list):
            # Include primary question
            primary_q = self.preprocess(faq.get("question", ""))
            if primary_q:
                self.corpus.append(primary_q)
                self.corpus_faq_map.append(faq_idx)

            # Include all alternative patterns (paraphrases)
            for pattern in faq.get("patterns", []):
                cleaned_p = self.preprocess(pattern)
                if cleaned_p and cleaned_p != primary_q:
                    self.corpus.append(cleaned_p)
                    self.corpus_faq_map.append(faq_idx)

        # Initialize Scikit-Learn TF-IDF Vectorizer
        # We use unigrams and bigrams (1,2) with English stop words filtering
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            norm="l2",
            sublinear_tf=True
        )

        # Fit vectorizer on corpus and transform into TF-IDF matrix
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    def match(self, query):
        """
        Matches a user query against the FAQ knowledge base.
        
        Returns:
            dict: {
                "matched": bool,
                "faq": dict or None,
                "confidence": float (0.0 to 1.0),
                "confidence_percent": str ("xx.x%"),
                "matched_pattern": str or None,
                "fallback_message": str or None,
                "top_candidates": list of {question, score}
            }
        """
        cleaned_query = self.preprocess(query)
        if not cleaned_query:
            return {
                "matched": False,
                "faq": None,
                "confidence": 0.0,
                "confidence_percent": "0.0%",
                "matched_pattern": None,
                "fallback_message": "Please enter a valid question regarding timetable, exams, or the academic calendar.",
                "top_candidates": []
            }

        # Vectorize the user query using the trained vectorizer
        query_vector = self.vectorizer.transform([cleaned_query])

        # Compute cosine similarity between the query vector and all corpus patterns
        # Shape: (1, num_corpus_items)
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Find best matching index
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        # Extract top 3 candidates for inspectability / viva demonstration
        top_indices = np.argsort(similarities)[::-1][:3]
        top_candidates = []
        for idx in top_indices:
            faq_item = self.faq_list[self.corpus_faq_map[idx]]
            top_candidates.append({
                "question": faq_item["question"],
                "matched_phrase": self.corpus[idx],
                "score": round(float(similarities[idx]), 4),
                "score_percent": f"{round(float(similarities[idx]) * 100, 1)}%"
            })

        matched = best_score >= self.confidence_threshold
        confidence_percent = f"{round(best_score * 100, 1)}%"

        if matched:
            matched_faq = self.faq_list[self.corpus_faq_map[best_idx]]
            matched_pattern = self.corpus[best_idx]
            return {
                "matched": True,
                "faq": matched_faq,
                "confidence": round(best_score, 4),
                "confidence_percent": confidence_percent,
                "matched_pattern": matched_pattern,
                "fallback_message": None,
                "top_candidates": top_candidates
            }
        else:
            return {
                "matched": False,
                "faq": None,
                "confidence": round(best_score, 4),
                "confidence_percent": confidence_percent,
                "matched_pattern": None,
                "fallback_message": (
                    "I couldn't find an exact match for your question (confidence score: "
                    f"{confidence_percent}, below threshold {round(self.confidence_threshold * 100)}%). "
                    "Try asking about your class timetable, holidays, examinations, working days, or academic calendar."
                ),
                "top_candidates": top_candidates
            }

    def explain_query(self, query):
        """
        Helper method for Viva / Debugger:
        Shows terms found in vocabulary and their TF-IDF weights in the user query.
        """
        cleaned_query = self.preprocess(query)
        if not cleaned_query:
            return {"terms": [], "vector_norm": 0}

        query_vec = self.vectorizer.transform([cleaned_query])
        feature_names = self.vectorizer.get_feature_names_out()
        
        cx = query_vec.tocoo()
        terms = []
        for col, val in zip(cx.col, cx.data):
            terms.append({
                "term": feature_names[col],
                "weight": round(float(val), 4)
            })

        terms.sort(key=lambda x: x["weight"], reverse=True)
        return {
            "cleaned_query": cleaned_query,
            "terms": terms,
            "vocabulary_size": len(feature_names)
        }

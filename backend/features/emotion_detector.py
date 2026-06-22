from textblob import TextBlob

def detect_emotion(text: str) -> str:
    """
    Detects emotion based on TextBlob sentiment polarity and subjectivity.
    - Polarity is in [-1.0, 1.0], where -1.0 is negative and 1.0 is positive.
    - Subjectivity is in [0.0, 1.0], where 0.0 is very objective and 1.0 is very subjective.
    
    Rules:
    - frustrated if polarity < -0.2
    - confused if subjectivity > 0.7 and polarity near 0 (-0.2 <= polarity <= 0.3)
    - confident if polarity > 0.3
    - else neutral
    """
    if not text or not text.strip():
        return "neutral"
        
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    if polarity < -0.2:
        return "frustrated"
    elif subjectivity > 0.7 and -0.2 <= polarity <= 0.3:
        return "confused"
    elif polarity > 0.3:
        return "confident"
    else:
        return "neutral"

def adapt_tone(emotion: str) -> str:
    """
    Returns specific tone instructions based on detected emotion.
    """
    if emotion == "frustrated":
        return "be gentle and encouraging"
    elif emotion == "confused":
        return "give step-by-step breakdown"
    elif emotion == "confident":
        return "give advanced insights"
    else:
        return "be helpful, clear, and professional"

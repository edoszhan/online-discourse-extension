import os
import time
from openai import OpenAI, APIError

def generate_topics_and_questions(text, max_retries=1, delay=1):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY env var is not set.")
    
    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    Please generate 4 diverse and distinct topics based on the following article text. 
    For each topic, also generate a thought-provoking question that can open a meaningful conversation among readers and help explore the topic further. 
    Each topic should be represented by a minimum of 4 words and a maximum of 5 words.
    Format the output as follows:
    Topic 1: <topic>
    Question 1: <question>
    Topic 2: <topic>
    Question 2: <question>
    Topic 3: <topic>
    Question 3: <question>
    Topic 4: <topic>
    Question 4: <question>
    
    Article text: {text}
    """ 

    retries = 0
    while retries < max_retries:
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates topics and questions based on given text."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                n=1,
                stop=None,
                temperature=0.7, 
            )
            response_text = chat_completion.choices[0].message.content.strip()
            topics_and_questions = [line.strip() for line in response_text.split("\n") if line.strip()]  
            topics = []
            questions = []
            suggested_topic_question = []
            
            for i in range(0, len(topics_and_questions), 2):
                topic_line = topics_and_questions[i].strip()
                question_line = topics_and_questions[i+1].strip()
                if topic_line and question_line:
                    if topic_line.startswith("Topic") and question_line.startswith("Question"):
                        topic = topic_line.split(":")[1].replace("**", "").strip()
                        question = question_line.split(":")[1].replace("**", "").strip()
                        if topic and question:
                            if len(topics) < 3:
                                topics.append(topic)
                                questions.append(question)
                            else:
                                suggested_topic_question = [topic, question]
            return topics, questions, suggested_topic_question
        except APIError as e:
            if e.status_code == 429:  
                retries += 1
                print(f"Rate limit exceeded. Retrying in {delay} seconds... (Attempt {retries}/{max_retries})")
                time.sleep(delay)
                delay *= 2 # arbitrary number
            else:
                raise e

    raise Exception("Failed to generate topics and questions after multiple retries.")

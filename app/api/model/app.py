from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import together
import random
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import re

# Initialize Flask app with CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
cred = credentials.Certificate('teconnectivity-8350e-firebase-adminsdk-fbsvc-bc68bca6c8.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load API key from .env
from dotenv import load_dotenv
load_dotenv()
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

if not TOGETHER_API_KEY:
    raise ValueError("TOGETHER_API_KEY is missing. Add it to the .env file.")

client = together.Together(api_key=TOGETHER_API_KEY)

# Global variable to store interview sessions (in production, use a database)
interview_sessions = {}

def fetch_questions_from_firebase(job_role):
    """
    Fetch questions from Firebase for a specific job role
    Returns a list of question dictionaries
    """
    questions = []
    
    # Query the questionBank collection for questions matching the job role
    question_query = db.collection('questionBank').where('jobRole', '==', job_role).stream()
    
    for doc in question_query:
        question_data = doc.to_dict()
        # Extract the relevant fields from the document
        questions.append({
            'question': question_data.get('question'),
            'category': question_data.get('category'),
            'difficulty': question_data.get('difficulty'),
            'expectedAnswer': question_data.get('expectedAnswer'),
            'skillTags': question_data.get('skillTags', []),
            'id': doc.id  # Include the document ID for reference
        })
    
    return questions

def get_llama_response(prompt):
    try:
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages=[
                {"role": "system", "content": "You provide direct answers without additional explanation unless specifically requested. When asked to score, provide only the numerical score."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,  # Lower temperature for more focused responses
            max_tokens=100    # Fewer tokens since we need just a short answer
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error: {e}")
        return "0"  # Default to 0 on error

def score_answer(question, answer):
    if not answer:
        return 0
    
    # Updated prompt to ensure direct scoring without additional commentary
    prompt = f"""
You are an interview evaluator. Score the following answer on a scale from 0 to 10.
0 means completely irrelevant or incorrect, 10 means perfect answer.

Question: {question}
Answer: {answer}

Provide ONLY a single number from 0-10 as your response, with no additional text, explanation, or commentary.
"""
    
    try:
        score_response = get_llama_response(prompt)
        # Extract just the first number in case the LLM returns additional text
        score_match = re.search(r'\b(10|\d)\b', score_response)
        if score_match:
            return int(score_match.group(1))
        return 0
    except Exception as e:
        print(f"Error in scoring: {e}")
        return 0


@app.route('/start_interview', methods=['POST'])
def start_interview():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
            
        email = data.get('email')
        job_role = data.get('jobRole')
        
        if not email or not job_role:
            return jsonify({'error': 'Missing email or jobRole'}), 400

        # Fetch questions from Firebase for the specified job role
        questions = fetch_questions_from_firebase(job_role)
        
        if not questions:
            # If no questions found, get a list of available job roles
            available_roles = []
            role_docs = db.collection('questionBank').select('jobRole').stream()
            for doc in role_docs:
                role = doc.to_dict().get('jobRole')
                if role and role not in available_roles:
                    available_roles.append(role)
                    
            return jsonify({
                'error': f'No questions found for job role: {job_role}',
                'availableRoles': available_roles
            }), 404

        # Generate session ID
        session_id = f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}_{email}"
        
        # Initialize session
        interview_sessions[session_id] = {
            'email': email,
            'job_role': job_role,
            'questions': random.sample(questions, min(10, len(questions))),
            'current_question_index': 0,
            'answers': [],
            'posture_score': 0,  # Initialize with default values
            'eye_score': 0,      # Initialize with default values
            'status': 'started'
        }

        # Return first question
        first_question = interview_sessions[session_id]['questions'][0]
        return jsonify({
            'sessionId': session_id,
            'question': first_question['question'],
            'category': first_question.get('category'),
            'difficulty': first_question.get('difficulty'),
            'questionId': first_question.get('id'),
            'status': 'started'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
    
    
@app.route('/next_question', methods=['GET'])
def next_question():
    session_id = request.args.get('sessionId')
    session = interview_sessions.get(session_id)
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    next_index = session['current_question_index'] + 1
    
    if next_index >= len(session['questions']):
        return jsonify({
            'message': 'Interview completed',
            'status': 'completed'
        })
    
    session['current_question_index'] = next_index
    next_question_obj = session['questions'][next_index]
    
    return jsonify({
        'sessionId': session_id,
        'question': next_question_obj['question'],
        'category': next_question_obj.get('category'),
        'difficulty': next_question_obj.get('difficulty'),
        'questionId': next_question_obj.get('id'),
        'status': 'in_progress'
    })

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    session_id = data.get('sessionId')
    answer = data.get('answer')
    
    session = interview_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    current_question_obj = session['questions'][session['current_question_index']]
    current_question = current_question_obj['question']
    expected_answer = current_question_obj.get('expectedAnswer')
    
    # Score the answer
    score = score_answer(current_question, answer)
    
    # Store answer and score
    session['answers'].append({
        'questionId': current_question_obj.get('id'),
        'question': current_question,
        'answer': answer,
        'score': score,
        'expectedAnswer': expected_answer,
        'category': current_question_obj.get('category'),
        'difficulty': current_question_obj.get('difficulty'),
        'timestamp': datetime.now().isoformat()
    })
    
    # Log to Firebase
    log_conversation(session['email'], session['job_role'], current_question, answer)
    log_score(session['email'], session['job_role'], current_question, answer, score)
    
    return jsonify({
        'sessionId': session_id,
        'score': score,
        'status': 'answer_received'
    })

@app.route('/end_interview', methods=['POST'])
def end_interview():
    data = request.get_json()
    session_id = data.get('sessionId')
    
    session = interview_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Calculate total score
    total_score = sum(answer['score'] for answer in session['answers'])
    max_possible_score = len(session['answers']) * 10
    percentage_score = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0
    
    # Log final scores to Firebase
    log_final_score(
        session['email'],
        session['job_role'],
        total_score,
        percentage_score,
        session['posture_score'],
        session['eye_score']
    )
    
    session['status'] = 'completed'
    
    return jsonify({
        'sessionId': session_id,
        'totalScore': total_score,
        'percentageScore': round(percentage_score, 2),
        'postureScore': session['posture_score'],
        'eyeScore': session['eye_score'],
        'status': 'completed'
    })

@app.route('/interview_report', methods=['GET'])
def interview_report():
    session_id = request.args.get('sessionId')
    session = interview_sessions.get(session_id)
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    total_score = sum(answer['score'] for answer in session['answers'])
    max_possible_score = len(session['answers']) * 10
    percentage_score = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0
    
    return jsonify({
        'sessionId': session_id,
        'email': session['email'],
        'jobRole': session['job_role'],
        'questions': [q['question'] for q in session['questions']],
        'answers': session['answers'],
        'totalScore': total_score,
        'percentageScore': round(percentage_score, 2),
        'postureScore': session['posture_score'],
        'eyeScore': session['eye_score'],
        'status': session['status']
    })

# Firebase logging functions
def log_conversation(user_name, role, question, answer, is_follow_up=False):
    conversation_ref = db.collection('conversations').document(user_name).collection(role)
    conversation_ref.add({
        'question': question,
        'answer': answer,
        'is_follow_up': is_follow_up,
        'timestamp': firestore.SERVER_TIMESTAMP
    })

def log_score(user_name, role, question, answer, score, is_follow_up=False):
    score_ref = db.collection('scores').document(user_name).collection(role)
    score_ref.add({
        'question': question,
        'answer': answer,
        'score': score,
        'is_follow_up': is_follow_up,
        'timestamp': firestore.SERVER_TIMESTAMP
    })

def log_final_score(user_name, role, total_score, percentage_score, posture_score, eye_score):
    final_score_ref = db.collection('final_scores').document(user_name)
    final_score_ref.set({
        'role': role,
        'total_score': total_score,
        'percentage_score': percentage_score,
        'posture_score': posture_score,
        'eye_score': eye_score,
        'timestamp': firestore.SERVER_TIMESTAMP
    }, merge=True)

@app.route('/update_posture_score', methods=['POST'])
def update_posture_score():
    data = request.get_json()
    session_id = data.get('sessionId')
    posture_score = data.get('score', 0)
    
    session = interview_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    session['posture_score'] = posture_score
    
    return jsonify({
        'sessionId': session_id,
        'postureScore': posture_score,
        'status': 'updated'
    })

@app.route('/update_eye_score', methods=['POST'])
def update_eye_score():
    data = request.get_json()
    session_id = data.get('sessionId')
    eye_score = data.get('score', 0)
    
    session = interview_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    session['eye_score'] = eye_score
    
    return jsonify({
        'sessionId': session_id,
        'eyeScore': eye_score,
        'status': 'updated'
    })

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or len(data) < 3:
        return jsonify({"prediction": "Not enough data yet (need 3+ days)", "risk_level": "low"})

    df = pd.DataFrame(data)
    
    # predict severity rating based on sleep, exercise, and meal count
    X = df[['nap_count', 'exercise_mins', 'meal_count']].values
    y = df['severity_rating'].values

    model = LinearRegression()
    model.fit(X, y)

    avg_features = np.array([[df['nap_count'].mean(), df['exercise_mins'].mean(), df['meal_count'].mean()]])
    prediction = model.predict(avg_features)[0]

    risk = "Low"
    if prediction > 7 or df['is_emergency'].any():
        risk = "High"
    elif prediction > 4:
        risk = "Moderate"

    return jsonify({
        "predicted_severity": round(float(prediction), 1),
        "risk_level": risk,
        "recommendation": "Maintain consistent sleep patterns." if risk == "Moderate" else "No immediate action needed."
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
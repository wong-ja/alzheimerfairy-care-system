from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or len(data) < 3:
        return jsonify({
            "predicted_severity": 5, 
            "risk_level": "Low", 
            "recommendation": "Start logging daily (at least 3 days) to see AI insights."
        })

    df = pd.DataFrame(data)
    # feature engineering
    df['severity_rating'] = pd.to_numeric(df['severity_rating'])
    df['agitation_level'] = pd.to_numeric(df['agitation_level'])
    df['mood_rating'] = pd.to_numeric(df['mood_rating'])
    df['memory_score'] = pd.to_numeric(df['memory_score'])
    df['meds_taken'] = df['meds_taken'].astype(int)
    
    features = ['severity_rating', 'agitation_level', 'mood_rating', 'meds_taken', 'nap_count']
    X = df[features].iloc[:-1] # all days except last
    y = df['severity_rating'].shift(-1).iloc[:-1] # tomorrow's prediction

    # Random Forest Model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    latest_log = df[features].iloc[[-1]]
    prediction = model.predict(latest_log)[0]

    latest_severity = df['severity_rating'].iloc[-1]
    diff = prediction - latest_severity
    
    risk = "Low"
    rec = "Model indicates a stable outlook. Maintain current care patterns."

    if prediction > 7 or diff > 1.5:
        risk = "High"
        rec = "Significant risk increase predicted. Review medication compliance and physical safety."
    elif prediction > 4 or diff > 0.5:
        risk = "Moderate"
        rec = "Slight upward trend detected. Monitor for increased agitation during evening hours."

    return jsonify({
        "predicted_severity": round(float(prediction), 1),
        "risk_level": risk,
        "recommendation": rec
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
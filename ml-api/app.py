from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or len(data) < 2:
        return jsonify({
            "predicted_severity": 5, 
            "risk_level": "Low", 
            "recommendation": "Start logging daily to see AI insights."
        })

    df = pd.DataFrame(data)
    df['checkin_date'] = pd.to_datetime(df['checkin_date'])
    df = df.sort_values('checkin_date')

    latest_severity = df['severity_rating'].iloc[-1]
    avg_sleep = df['nap_count'].mean()
    severity_trend = df['severity_rating'].diff().tail(3).mean()

    rec = "Status is stable. Keep up the routine."
    risk = "Low"

    if severity_trend > 0.5:
        risk = "Moderate"
        rec = "Symptoms show a slight upward trend. Check for changes in medication or environment."
    
    if latest_severity > 7 or df['is_emergency'].any():
        risk = "High"
        rec = "High severity detected. Ensure caregiver support is available and review recent notes."

    if avg_sleep > 2:
        rec += " Excessive daytime napping detected, which can correlate with sundowning."

    return jsonify({
        "predicted_severity": float(latest_severity + (severity_trend if not np.isnan(severity_trend) else 0)),
        "risk_level": risk,
        "recommendation": rec
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
export interface WellnessLog {
    [key: string]: string | number | boolean | null | undefined;
    id?: string;
    user_id: string;
    checkin_date: string;
    wake_time: string | null;
    nap_count: number;
    exercise_mins: number;
    meal_details: string | null;
    severity_rating: number;
    agitation_level: number;
    mood_rating: number;
    memory_score: number;
    meds_taken: boolean;
    is_emergency: boolean;
    notes: string | null;
}
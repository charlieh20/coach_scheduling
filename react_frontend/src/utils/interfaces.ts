export interface User {
    id: number,
    name: string,
    phone: string,
    role: string,
}

export interface Slot {
    id: number,
    coach_name?: string,
    coach_phone?: string,
    student_name?: string,
    student_phone?: string,
    date: string,
    time: string,
    past?: boolean,
}

export interface Review {
    id: number,
    student_name: string,
    score: number,
    note: string,
}
import { Review, Slot, User } from "./interfaces";

const apiUrl = 'http://localhost:80';

// USER REQUESTS
export const getUserByName = async (name: string): Promise<User[] | undefined> => {
    try {
        const result = await fetch(`${apiUrl}/users/name/${name}`);
        const data = await result.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}

// SLOT REQUESTS
export const getSlots = async (page: number, id?: number | string, role?: string): Promise<Slot[]> => {
    try {
        const url = id ? `${apiUrl}/slots?id=${id}&role=${role}&page=${page}`
            : `${apiUrl}/slots?page=${page}`
        const result = await fetch(url);
        const data = await result.json();
        let slots: Slot[] = []
        for (let i = 0; i < data.length; i += 1) {
            const slot: Slot = {...data[i]};
            // format date nicely for rendering
            const dateObj = new Date(data[i].time);
            const goodDate = formatDate(dateObj);
            slot.date = goodDate[0];
            slot.time = goodDate[1];
            const current = new Date();
            slot.past = current > dateObj;

            slots = [...slots, slot];
        }
        console.log(slots)
        return slots;
    } catch (e) {
        console.log(e);
        return []
    }
}

export const countSlots = async (id?: number | string, role?: string): Promise<number> => {
    try {
        let url = id ? `${apiUrl}/slots/count?id=${id}&role=${role}`
            : `${apiUrl}/slots/count`;
        const result = await fetch(url);
        const data = await result.json();
        return data[0].count;
    } catch (e) {
        console.log(e);
        return 0;
    }
}

export const createSlot = async (id: number | string, time: string): Promise<number> => {
    try {
        const body = JSON.stringify({
            'coach_id': id,
            'time': time,
        });
        const result = await fetch(`${apiUrl}/slots`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
        return result.status;
    } catch (e) {
        console.log(e);
        return 500;
    }
}

export const claimSlot = async (id: number | string, slot_id: number): Promise<boolean> => {
    try {
        const body = JSON.stringify({ student_id: id, slot_id: slot_id });
        const result = await fetch(`${apiUrl}/slots`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
        return result.status === 200;
    } catch(e) {
        console.log(e);
        return false;
    }
}

// REVIEW REQUESTS
export const getReviewsByCoach = async (id: number | string, page: number): Promise<Review[]> => {
    try {
        const result = await fetch(`${apiUrl}/reviews/${id}?page=${page}`);
        const data = await result.json();
        return data;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export const countReviews = async (id: number | string): Promise<number> => {
    try {
        const result = await fetch(`${apiUrl}/reviews/count/${id}`);
        const data = await result.json();
        return data[0].count;
    } catch (e) {
        console.log(e);
        return 0;
    }
}

export const addReview = async(slot_id: number, score: number, note: string) => {
    try {
        const body = JSON.stringify({
            slot_id: slot_id,
            score: score,
            note: note,
        });
        const result = await fetch(`${apiUrl}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
        return result.status === 201;
    } catch (e) {
        console.log(e);
        return false;
    }
}

// UTILS
const formatDate = (dateObj: Date): string[] => {
    // get formatted date
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // Months are zero-indexed
    const day = dateObj.getDate();
    const date = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}/${year}`;

    // get formatted time
    let hours = dateObj.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let minutes: string | number = dateObj.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const time = `${hours}:${minutes} ${ampm}`;

    return [date, time];
}
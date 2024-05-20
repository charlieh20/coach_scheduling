import React, { useState } from 'react';
import { Button, Form, GridRow, Header, Input, Message } from 'semantic-ui-react';
import { createSlot } from '../utils/services';

interface PostSlotsProps {
    userId: number,
    triggerRefresh: () => void,
}

export const PostSlots: React.FC<PostSlotsProps> = ({ userId, triggerRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [error, setError] = useState<number | undefined>(undefined);

    const handleSubmit = async () => {
        setLoading(true);
        const datetime = `${date} ${time}:00`;
        const response = await createSlot(userId, datetime);
        if (response === 201) {
            setDate('');
            setTime('');
            setError(undefined);
            triggerRefresh();
        } else {
            setError(response);
        }
        setLoading(false);
    };

    return (<>
        <GridRow>
            <Header>Add Availability</Header>
        </GridRow>
        <GridRow>
            <Form onSubmit={handleSubmit}>
                <Form.Group inline>
                    <Form.Field>
                        <label>Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Time</label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </Form.Field>
                    <Button loading={loading} primary type="submit">Submit</Button>
                </Form.Group>
                {error && (
                    <Message negative>
                        <Message.Header content={error === 409 ? 'Time Conflict' : 'Posting Error'} />
                        <p>
                            {error === 409 ?
                                'Existing appointment overlaps with this one. Please select another time.'
                                    :
                                'Failed to post appointment.'}
                        </p>
                    </Message>
                )}
            </Form>
        </GridRow>
    </>)
}
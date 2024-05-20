import React, { useState } from 'react';
import { Button, Form, Modal, Select, TextArea } from 'semantic-ui-react';
import { addReview } from '../utils/services';

interface ReviewModalProps {
    slotId: number | undefined,
    refresh: () => void,
    close: () => void,
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ slotId, refresh, close }) => {
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState<number>(5);
    const [note, setNote] = useState('');

    const handlePost = async () => {
        setLoading(true);
        
        const response = await addReview(slotId!, score, note);
        if (response) {
            refresh();
            handleClose();
        } else {
            console.log('Error posting review.');
        }
        setLoading(false);
    }

    const handleClose = () => {
        setScore(5);
        setNote('');
        close();
    }

    return (<Modal open={slotId !== undefined}>
        <Modal.Header>
            Add Review
        </Modal.Header>
        <Modal.Content>
            <Form>
                <Form.Field>
                    <label>Student Score</label>
                    <Select
                        value={score}
                        onChange={(_, { value }) => {setScore(typeof value === 'number' ? value : score)}}
                        options={Array.from(Array(5), (_, i) => { return {key: i+1, value: i+1, text: i+1} })}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Meeting Notes</label>
                    <TextArea
                        placeholder={'Write a note...'}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </Form.Field>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button 
                negative
                onClick={handleClose}
            >
                Cancel
            </Button>
            <Button 
                positive
                loading={loading}
                onClick={handlePost}
            >
                Post
            </Button>
        </Modal.Actions>
    </Modal>)
}
import React, { useEffect, useState } from 'react';
import { Button, GridRow, Header, Pagination, Table } from 'semantic-ui-react'
import { Slot } from '../utils/interfaces';
import { countSlots, getSlots } from '../utils/services';
import { ReviewModal } from './ReviewModal';

interface ScheduledSlotsProps {
    userId: number,
    userRole: string,
    refresh: number,
    triggerRefresh: () => void,
}

export const ScheduledSlots: React.FC<ScheduledSlotsProps> = ({ userId, userRole, refresh, triggerRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState<Slot[]>();
    const [reviewingSlot, setReviewingSlot] = useState<number | undefined>(undefined);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const coach = userRole === 'coach';

    useEffect(() => {
        setLoading(true);

        const updateTotalPages = async () => {
            const count = await countSlots(userId, userRole);
            if (count) {
                setTotalPages(Math.ceil(count/5));
            } else {
                setTotalPages(1);
            }
            setLoading(false);
        }
        updateTotalPages();
    }, [userId, userRole, refresh])

    useEffect(() => {
        setLoading(true);

        const loadSlots = async() => {
            const data = await getSlots(currentPage-1, userId, userRole);
            setSlots(data);
            setLoading(false);
        }

        loadSlots()
    }, [userId, userRole, refresh, currentPage])

    return (
        <GridRow>
            <Header>Scheduled Appointments</Header>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell content={'Date'} />
                        <Table.HeaderCell content={'Time'} />
                        <Table.HeaderCell content={coach ? 'Student Name' : 'Coach Name'} />
                        <Table.HeaderCell content={'Phone Number'} />
                        {coach &&
                            <Table.HeaderCell content='Actions' />}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {loading || !slots ?
                        <Table.Row colSpan={coach ? 5 : 4}>
                            Loading...
                        </Table.Row> :
                    slots.length === 0 ? 
                        <Table.Row colSpan={coach ? 5 : 4}>
                            No scheduled appointments found.
                        </Table.Row>
                            :
                        (slots.map((slot: Slot) => 
                            <Table.Row key={slot.id}>
                                <Table.Cell content={slot.date} />
                                <Table.Cell content={slot.time} />
                                <Table.Cell content={coach ? (slot.student_name ? slot.student_name : 'EMPTY') : slot.coach_name} />
                                <Table.Cell content={coach ? (slot.student_phone ? slot.student_phone : 'N/A') : slot.coach_phone} />
                                {coach &&
                                    <Table.Cell>
                                        {slot.student_name && slot.past &&
                                                <Button content={'Review'} primary onClick={() => setReviewingSlot(slot.id)} />}
                                    </Table.Cell>}
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table>
            {coach &&
                <ReviewModal slotId={reviewingSlot} refresh={triggerRefresh} close={() => setReviewingSlot(undefined)} />}
            {totalPages > 1 &&
                <Pagination
                    disabled={loading}
                    activePage={currentPage} 
                    onPageChange={(_, { activePage }) => setCurrentPage(typeof activePage=='number' ? activePage : 1)}
                    totalPages={totalPages}
                />}
        </GridRow>
    )
}
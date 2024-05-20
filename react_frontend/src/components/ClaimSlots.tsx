import React, { useState, useEffect } from 'react';
import { Slot } from '../utils/interfaces';
import { claimSlot, countSlots, getSlots } from '../utils/services';
import { Button, GridRow, Header, Pagination, Table } from 'semantic-ui-react';

interface ClaimSlotsProps {
    userId: number,
    refresh: number,
    triggerRefresh: () => void,
}

export const ClaimSlots: React.FC<ClaimSlotsProps> = ({ userId, refresh, triggerRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState<Slot[]>();
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setLoading(true);

        const updateTotalPages = async () => {
            const count = await countSlots();
            if (count) {
                setTotalPages(Math.ceil(count/5));
            } else {
                setTotalPages(1);
            }
            setLoading(false);
        }
        updateTotalPages();
    }, [refresh])

    useEffect(() => {
        setLoading(true);

        const loadSlots = async () => {
            const data = await getSlots(currentPage-1);
            setSlots(data);
            setLoading(false);
        }

        loadSlots()
    }, [refresh, currentPage])

    const handleClaim = async (slot_id: number) => {
        const response = await claimSlot(userId, slot_id);
        if (response) {
            triggerRefresh();
        } else {
            console.log('Error in claiming slot.');
        }
    }

    return (
        <GridRow>
            <Header>Available Appointments</Header>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell content={'Date'} />
                        <Table.HeaderCell content={'Time'} />
                        <Table.HeaderCell content={'Coach Name'} />
                        <Table.HeaderCell content={'Action'} />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {loading || !slots ?
                        <Table.Row colSpan = '3'>
                            Loading...
                        </Table.Row>
                            :
                    slots.length === 0 ? 
                        <Table.Row colSpan ='3' content={'No available appointments found.'} />
                            :
                        (slots.map((slot: Slot) => 
                            (<Table.Row key={slot.id}>
                                <Table.Cell content={slot.date} />
                                <Table.Cell content={slot.time} />
                                <Table.Cell content={slot.coach_name} />
                                <Table.Cell>
                                    <Button
                                        content={'Sign Up'}
                                        positive
                                        onClick={() => handleClaim(slot.id)}
                                    />
                                </Table.Cell>
                            </Table.Row>)
                        ))
                    }
                </Table.Body>
            </Table>
            {totalPages > 1 &&
                <Pagination 
                    disabled={loading}
                    activePage={currentPage} 
                    onPageChange={(_, { activePage }) => setCurrentPage(typeof activePage=='number' ? activePage : 0)}
                    totalPages={totalPages}
                />}
        </GridRow>
    )
}
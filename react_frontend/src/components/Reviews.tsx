import React, { useEffect, useState } from 'react';
import { GridRow, Header, Pagination, Table } from 'semantic-ui-react'
import { Review } from '../utils/interfaces';
import { countReviews, getReviewsByCoach } from '../utils/services';

interface ReviewProps {
    userId: number,
    refresh: number,
}

export const Reviews: React.FC<ReviewProps> = ({ userId, refresh }) => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>();
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        setLoading(true);

        const updateTotalPages = async () => {
            const count = await countReviews(userId)
            if (count) {
                setTotalPages(Math.ceil(count/5));
            } else {
                setTotalPages(1);
            }
            setLoading(false);
        }
        updateTotalPages();
    }, [userId, refresh])

    useEffect(() => {
        setLoading(true);

        const getReviews = async () => {
            const data = await getReviewsByCoach(userId, currentPage-1);
            setReviews(data);
            setLoading(false);
        }
        getReviews();
    }, [userId, refresh, currentPage])

    return (
        <GridRow>
            <Header>Past Reviews</Header>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell content={'Student Name'} />
                        <Table.HeaderCell content={'Rating'} />
                        <Table.HeaderCell content={'Note'} />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {loading || !reviews ?
                        <Table.Row colSpan='3'>
                            Loading...
                        </Table.Row> :
                    reviews.length === 0 ? 
                        <Table.Row colSpan ='3'>
                            No reviews found.
                        </Table.Row>
                            :
                        (reviews.map((review: Review) => 
                            (<Table.Row key={review.id}>
                                <Table.Cell content={review.student_name} />
                                <Table.Cell content={review.score} />
                                <Table.Cell content={review.note} />
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
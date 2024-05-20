import React, { useState } from 'react';
import { Container, Form, Menu } from 'semantic-ui-react'
import { User } from '../utils/interfaces';

interface MenuBarProps {
    user: User,
    changeUser: (id: string) => Promise<void>
}

export const MenuBar: React.FC<MenuBarProps> = ({ user, changeUser }) => {
    const [newUser, setNewUser] = useState('');

    return (
        <Menu fixed='top' inverted>
            <Container>
                <Menu.Item content={`Current user: ${user.name}`} />
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Form onSubmit={() => changeUser(newUser)}>
                            <Form.Input
                                placeholder='Change user...'
                                name='user'
                                value={newUser}
                                onChange={(_, { value }) => setNewUser(value)}
                            />
                        </Form>
                    </Menu.Item>
                </Menu.Menu>
            </Container>
        </Menu>
    )
}
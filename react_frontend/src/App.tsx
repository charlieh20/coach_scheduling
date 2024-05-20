import React, { useState } from 'react';
import { User } from './utils/interfaces';
import { Divider, Grid, Loader } from 'semantic-ui-react';
import { MenuBar } from './components/MenuBar';
import { getUserByName } from './utils/services';
import { ScheduledSlots } from './components/ScheduledSlots';
import { PostSlots } from './components/PostSlots';
import { ClaimSlots } from './components/ClaimSlots';
import { Reviews } from './components/Reviews';
import './App.css';

const defaultUser: User = {
  id: 1,
  name: 'coach1',
  phone: '123',
  role: 'coach',
}

const App = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const changeUser = async (name: string) => {
    setLoading(true);

    const newUser = await getUserByName(name);
    if (newUser && newUser.length > 0) {
      setCurrentUser(newUser[0]);
    } else {
      console.log('Failed to change user.')
    }
    setLoading(false);
  }

  return (
    <div className='App'>
      {loading ? (<Loader>Loading...</Loader>) : 
        <>
          <MenuBar user={currentUser} changeUser={changeUser} />
          <Grid className='Content'>
            <ScheduledSlots userId={currentUser.id} userRole={currentUser.role} refresh={count} triggerRefresh={() => setCount(c => c+1)} />
            <Divider />
            {currentUser.role === 'coach' ? <PostSlots userId={currentUser.id} triggerRefresh={() => setCount(c => c+1)} /> :
              <ClaimSlots userId={currentUser.id} refresh={count} triggerRefresh={() => setCount(c => c+1)} />}
            {currentUser.role === 'coach' &&
              <>
                <Divider />
                <Reviews userId={currentUser.id} refresh={count} />
              </>}
          </Grid>
        </>
      }
    </div>
  );
}

export default App;

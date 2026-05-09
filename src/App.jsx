import { useState, useRef, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { io } from 'socket.io-client'
import './App.css'

//components.
import { GroupsList } from './react-components/GroupsList'
import { LoginPage } from './react-components/LoginPage'
import { RegisterPage } from './react-components/RegisterPage'
import { CreateGroupModel } from './react-components/CreateGroupModel'
import { JoinGroupModel } from './react-components/JoinGroupModel'
import { Header } from './react-components/Header'
import { ChatInterface } from './react-components/ChatInterface'

//api.
import { fetchGroups } from './api/groups'
import { fetchMessages } from './api/messages'
import { fetchUserDataByToken } from './api/auth'

//context.
import { AppContext } from './context/AppContext'
import { ToastContext } from './context/ToastContext'

export let socket;

function App() {
  //states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [groupsData, setGroupsData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messagesData, setMessagesData] = useState([]);
  const [showMembersList, setShowMembersList] = useState(false);

  //Preparation for forms
  const createGroupModelRef = useRef(null);
  const joinGroupModelRef = useRef(null);
  const showLoginLinkRef = useRef(null);
  const showRegisterLinkRef = useRef(null);
  const groupListRef = useRef(null);
  const toastBoxRef = useRef(null);

  //For responsive.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  //For mobile device.
  /*mobile views:
    login, register, groupslist, chat, memberslist;
  */
  const [currentView, setCurrentView] = useState('login');

  //Login automatically without filling login form.
  const loginByToken = useCallback(async () => {
    try {
      //Get user's data.
      const user = await fetchUserDataByToken(localStorage.getItem('token'));

      //Store user's data.
      localStorage.setItem('username', user.username);
      localStorage.setItem('userId', user._id);

      //Set login status.
      setIsLoggedIn(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        //When the token cannot be verified successfully.

        //Clear user's data.
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');

        //Set login status.
        setIsLoggedIn(false);

        return;
      }
    }
  });

  //For status/data initialization.
  const loadGroups = useCallback(async () => {
    const groupsData = await fetchGroups();
    setGroupsData(groupsData);
  });
  const loadMessages = useCallback(async (groupId) => {
    const messagesData = await fetchMessages(groupId);
    setMessagesData(messagesData);
  });

  const selectGroup = useCallback((groupData) => {
    //Set status.
    setSelectedGroup(groupData);
    //Join an online group.
    socket.emit('join-group', groupData._id);
  });

  const showToast = useCallback((content) => {
    toastBoxRef.current?.show(content);
  });

  //Conditional Rendering.
  let content;

  if (isLoggedIn) {
    //When logged in.
    content =
      <div
        key='home-page'
        className='home-page'
      >
        <CreateGroupModel
          ref={createGroupModelRef}
        />
        <JoinGroupModel
          ref={joinGroupModelRef}
        />

        <Header />
        <div
          className='body'
        >
          {!(selectedGroup && isMobile) &&
            <GroupsList
              ref={groupListRef}
              groupsData={groupsData}
            />
          }
          {selectedGroup && <ChatInterface />}
        </div>
      </div>
    ;
  } else {
    //When not logged in.
    if (showLogin) {
      content =
        <LoginPage />
      ;
    } else {
      content =
        <RegisterPage />
      ;
    }
  }

  //before login initializatin.

  //If have token then login.
  useEffect(() => {
    if (localStorage.getItem('token')) {
      loginByToken();
    }
  });

  useEffect(() => {
    //Login initialization.
    if (isLoggedIn) {
      loadGroups();

      if (!socket) {
        socket = io('http://localhost:3000', {
          auth: {
            token: localStorage.getItem('token')
          }
        });

        //Handle received messages.
        socket.on('message', (messageData) => {
          setMessagesData(preMessagesData => preMessagesData.concat(messageData));
        });
      }
    }
  }, [isLoggedIn]);

  //React to "select group" action.
  useEffect(() => {
    if (selectedGroup) {
      loadMessages(selectedGroup._id);
    }
  }, [selectedGroup]);

  return (
    <AppContext.Provider value={{
      setGroupsData,
      selectGroup,
      selectedGroup, setSelectedGroup,
      showMembersList, setShowMembersList,
      isLoggedIn, setIsLoggedIn,
      showLogin, setShowLogin,
      messagesData,
      joinGroupModelRef, createGroupModelRef,
      showToast,
      isMobile,
      currentView, setCurrentView
    }}>
      <ToastContext.Provider value={{ showToast }}>
        <toast-box ref={toastBoxRef}></toast-box>
        {content}
      </ToastContext.Provider>
    </AppContext.Provider>
  )
}

export default App
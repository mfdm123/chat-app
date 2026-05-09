import { useContext, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";

import { formatDate } from "../utils";

export const MessagesList = () => {
  const messagesListRef = useRef(null);

  const { messagesData, isMobile } = useContext(AppContext);

  useEffect(() => {
    //Automatically scroll to the bottom.
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  }, [messagesData]);

  return (
    <ul
      key='messages-list'
      ref={messagesListRef}
      className='messages-list'
      >
        {messagesData.map((messageData) => {
          const currentUserId = localStorage.getItem('userId');
          if (messageData.sender._id !== currentUserId) {
            return (
            <li
              key={messageData._id}
            >
              <div
                className='avatar'
              >
                {messageData.sender.username.charAt(0)}
              </div>
              <div
                className='body'
              >
                <span
                  className='username'
                >
                  {messageData.sender.username}
                </span>
                <div
                  className='message-card'
                >
                  <p>{messageData.content}</p>
                </div>
                <span
                  className='date'
                >
                  {formatDate(messageData.createAt)}
                </span>
              </div>
            </li>
            );
          } else {
            return (
            <li
              key={messageData._id}
              className='is-owner'
            >
              <div
                className='avatar'
              >
                {messageData.sender.username.charAt(0)}
              </div>
              <div
                className='body'
              >
                <span
                  className='username'
                >
                  {messageData.sender.username}
                </span>
                <div
                  className='message-card'
                >
                  <p>{messageData.content}</p>
                </div>
                <span
                  className='date'
                >
                  {formatDate(messageData.createAt)}
                </span>
              </div>
            </li>
            );
          }
        })}
    </ul>
  );
};
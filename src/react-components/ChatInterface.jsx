import { useCallback, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";

//Components.
import { MessagesList } from './MessagesList'
import { MembersList } from './MembersList'

//Api.
import { sendMessage } from "../api/messages";

export const ChatInterface = () => {
  const messageInputRef = useRef(null);

  const { selectedGroup, setSelectedGroup, setShowMembersList, isMobile } = useContext(AppContext);

  const handleSendMessageButtonClick = useCallback(() => {
    const message = messageInputRef.current.value;

    //Test whether the input is empty.
    if (message.length > 0) {
      sendMessage(selectedGroup._id, message);
      messageInputRef.current.value = '';
    } else {
      console.error('You cannot send empty message.');
    }
  });

  const handleBackToGroupsListButtonClick = useCallback(() => {
    setShowMembersList(false);
    setSelectedGroup(null);
  });

  return (
    <div
      key='chat-interface'
      className='chat-interface'
    >
      <div
        className='title-row'
      >
        <div className="left">
          {isMobile &&
            <button
              className="back-to-groups-list-button"
              onClick={handleBackToGroupsListButtonClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
          }
          <span className='group-name'>{selectedGroup.name}</span>
        </div>

        <x-dropdown
          className='dropdown'
          align='right'
          auto-close
        >
          <button
            slot='trigger'
            className='trigger'
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => {
              setShowMembersList(true);
            }}
          >
            Group Members
          </button>
        </x-dropdown>
      </div>
      <div
        className='group-items'
      >
        <MessagesList />
        <MembersList />
      </div>
      <div
        className='message-input-row'
      >
        <input
          type='text'
          ref={messageInputRef}
          className='message-input'
        />
        <button
          className='send-message-button'
          onClick={handleSendMessageButtonClick}
        >
          Send
        </button>
      </div>
    </div>
  );
}
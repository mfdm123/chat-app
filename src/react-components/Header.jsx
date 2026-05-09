import { useCallback, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContext } from "../context/ToastContext";

export const Header = () => {
  const { joinGroupModelRef, createGroupModelRef, setIsLoggedIn } = useContext(AppContext);

  const { showToast } = useContext(ToastContext);
  
  const handleLogoutButtonClick = useCallback(() => {
    //Clear user's data.
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');

    //Set login status.
    setIsLoggedIn(false);

    showToast('Logout successful.');
  });

  return (
    <div
      className='header'
    >
      <div
        className="left"
      >
        <div className="avatar">{localStorage.getItem('username').charAt(0)}</div>
        <div className="user-info">
          <span className="username">{localStorage.getItem('username')}</span>
          <span className="user-id">id: {localStorage.getItem('userId')}</span>
        </div>
      </div>
      <x-dropdown
        auto-close
        key='header-dropdown'
        align='right'
        className='header-dropdown'
      >
        <button
          slot='trigger'
          className='trigger'
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={handleLogoutButtonClick}
        >
          Log out
        </button>
        <button
          onClick={() => {
            createGroupModelRef.current.open();
          }}
        >
          Create a group
        </button>
        <button
          onClick={() => {
            joinGroupModelRef.current.open();
          }}
        >
          Join a group
        </button>
      </x-dropdown>
    </div>
  );
}
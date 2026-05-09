import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export const MembersList = ({ membersData }) => {
  const { selectedGroup, setShowMembersList, showMembersList } = useContext(AppContext);

  if (selectedGroup && showMembersList) {
    return (
      <div
          className='members-list'
          key='members-list'
        >
          <div
            className='title-row'
          >
            <button
              className='fold-button'
              onClick={() => {
                setShowMembersList(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
              </svg>
            </button>
            <span>Group Members</span>
          </div>
          <ul>
            {
              selectedGroup.members.map(memberData => 
                <li
                  key={memberData._id}
                >
                  <div className="avatar">{memberData.username.charAt(0)}</div>
                  <span className="username">{memberData.username}</span>
                </li>
              )
            }
          </ul>
      </div>
    );
  }
}
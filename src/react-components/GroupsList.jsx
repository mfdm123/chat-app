import { useCallback, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContext } from "../context/ToastContext";

//Api.
import { deleteGroup } from "../api/groups";

export const GroupsList = ({ groupsData }) => {
  const { setGroupsData, selectGroup } = useContext(AppContext);

  const { showToast } = useContext(ToastContext);

  const handleDeleteGroupButtonClick = useCallback((groupId) => {
    deleteGroup(groupId);

    //Clear deleted group's data.
    setGroupsData(preGroupsData => preGroupsData.filter(g => g._id !== groupId));

    showToast('Group deleted.')
  });

  return (
    <ul
        key='groups-list'
        className='groups-list'
      >
        <span
          className='title'
        >
          Group list
        </span>
        {
          groupsData.map(groupData => 
            <li
              key={groupData._id}
            >
              <button
                className='open-group-button'
                onClick={() => {
                  selectGroup(groupData);
                }}
              >

                <div
                  className='avatar'
                >
                  {groupData.name.charAt(0)}
                </div>
                <span className='group-name'>{groupData.name}</span>
              </button>

              <x-dropdown
                auto-close
                align='right'
              >
                <button
                  slot='trigger'
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                  </svg>
                </button>

                <div
                  className='code-row'
                >
                  <span className='code'>Code: {groupData.code}</span>
                  <button
                    className='copy-button'
                    onClick={() => {
                      navigator.clipboard.writeText(groupData.code);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                  </button>
                </div>

                {(localStorage.getItem('userId') === groupData.owner) ? (<button
                  className='delete-button'
                  onClick={() => {
                    handleDeleteGroupButtonClick(groupData._id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  <span>Delete</span>
                </button>) : null}

              </x-dropdown>
            </li>
          )
        }
      </ul>
    );
};
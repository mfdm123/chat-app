import API_BASE from '../config';

import { forwardRef, useCallback, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContext } from "../context/ToastContext";

export const CreateGroupModel = forwardRef((_, ref) => {
  const createGroupFormRef = useRef(null);

  const { isLoggedIn, setGroupsData } = useContext(AppContext);

  const { showToast } = useContext(ToastContext);

  const handleCreateGroupFormSuccess = useCallback(async (e) => {
      //Get data.
      const { result } = e.detail;
      const { group, message } = result;

      //Update groups data.
      setGroupsData(preGroupsData => preGroupsData.concat(group));

      //Close model automatically.
      ref.current.close();

      console.log(message);
      showToast(message);
  });

  useEffect(() => {
    if (createGroupFormRef.current) {
      //Config Headers.
      createGroupFormRef.current.requestHeaders = {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      };

      //BindEvents.
      createGroupFormRef.current.addEventListener('x-form:success', handleCreateGroupFormSuccess);
    }
  }, [isLoggedIn]);

  return (
    <x-model
      className='create-group-model'
      close-on-overlay
      ref={ref}
    >
      <div
        className='create-group-interface'
      >
        <span
          className='title'
        >
          Create a group
        </span>
        <x-form
          key='create-group-form'
          url={API_BASE}
          ref={createGroupFormRef}
          className='create-group-form'
        >
          <form-item type='text' label='Group Name' name='name' required></form-item>
          <button slot="submit-button">Confirm</button>
        </x-form>
      </div>
    </x-model>
  );
});
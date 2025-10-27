import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const GroupDetails = ({ group, onClose, refreshGroups }) => {
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState(group.name);
  const [groupDesc, setGroupDesc] = useState(group.description);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/${group._id}/members`, { withCredentials: true });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const removeMember = async (memberId) => {
    try {
      await axios.post(`${BASE_URL}/groups/${group._id}/removeMember`, { memberId }, { withCredentials: true });
      toast.success("Member removed");
      fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    }
  };

  const updateGroup = async () => {
    try {
      await axios.post(`${BASE_URL}/groups/${group._id}/update`, { name: groupName, description: groupDesc }, { withCredentials: true });
      toast.success("Group updated");
      refreshGroups();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update group");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl shadow-xl">
        <button onClick={onClose} className="text-red-500 font-bold float-right">X</button>
        <h2 className="text-2xl font-bold text-blue-500 mb-4">Group Details</h2>

        <div className="mb-4">
          <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full px-4 py-2 mb-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
          <input type="text" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
          <button onClick={updateGroup} className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Update Group</button>
        </div>

        <h3 className="text-xl font-bold text-purple-500 mb-3">Members</h3>
        <ul className="space-y-2">
          {members.map(member => (
            <li key={member._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span>{member.firstName} {member.lastName} ({member.email}) {member._id === group.owner && "(Owner)"}</span>
              {member._id !== group.owner && (
                <button onClick={() => removeMember(member._id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg">Remove</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupDetails;

'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

type Friend = {
  id: string;
  email: string;
};

type FriendRequest = {
  id: string;
  from: string;
  to: string;
};


const FriendsPage = () => {
  const userEmail = auth.currentUser?.email ?? '';

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch friends where userEmails contains userEmail
  const fetchFriends = async () => {
    setLoading(true);
    const friendsRef = collection(db, 'friends');
    const q = query(friendsRef, where('userEmails', 'array-contains', userEmail));
    const snapshot = await getDocs(q);
    const fetchedFriends: Friend[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const otherEmail = data.userEmails.find((email: string) => email !== userEmail);
      if (otherEmail) fetchedFriends.push({ id: doc.id, email: otherEmail });
    });
    setFriends(fetchedFriends);
    setLoading(false);
  };

  // Fetch incoming friend requests (to current user)
  const fetchFriendRequests = async () => {
    const reqRef = collection(db, 'friendRequests');
    const q = query(reqRef, where('to', '==', userEmail));
    const snapshot = await getDocs(q);
    const requests: FriendRequest[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({ id: doc.id, from: data.from, to: data.to });
    });
    setFriendRequests(requests);
  };

  // Send friend request
  const sendFriendRequest = async () => {
    const email = newFriendEmail.trim().toLowerCase();
    if (!email) return alert('Please enter an email.');
    if (email === userEmail) return alert("You can't send request to yourself.");

    // Check already friends
    if (friends.some((f) => f.email === email)) return alert('Already friends.');

    // Check if request already sent or received
    const reqRef = collection(db, 'friendRequests');
    const qSent = query(reqRef, where('from', '==', userEmail), where('to', '==', email));
    const qReceived = query(reqRef, where('from', '==', email), where('to', '==', userEmail));

    const sentSnap = await getDocs(qSent);
    const receivedSnap = await getDocs(qReceived);

    if (!sentSnap.empty) return alert('Friend request already sent.');
    if (!receivedSnap.empty) return alert('You have a pending friend request from this user.');

    await addDoc(reqRef, { from: userEmail, to: email });
    setNewFriendEmail('');
    alert('Friend request sent!');
  };

  // Accept friend request
  const acceptRequest = async (requestId: string, fromEmail: string) => {
    const friendsRef = collection(db, 'friends');
    await addDoc(friendsRef, { userEmails: [userEmail, fromEmail] });
    await deleteDoc(doc(db, 'friendRequests', requestId));
    fetchFriendRequests();
    fetchFriends();
  };

  // Reject friend request
  const rejectRequest = async (requestId: string) => {
    await deleteDoc(doc(db, 'friendRequests', requestId));
    fetchFriendRequests();
  };

  // Remove friend
  const removeFriend = async (friendId: string) => {
    if (!confirm('Remove this friend?')) return;
    await deleteDoc(doc(db, 'friends', friendId));
    fetchFriends();
  };

  useEffect(() => {
    if (!userEmail) return;
    fetchFriends();
    fetchFriendRequests();
  }, [userEmail]);

  return (
    
    <div className="pt-20 px-4 max-w-md mx-auto">     
      <h1 className="text-3xl font-bold mb-6">Friends</h1>

      {/* Add Friend */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Add Friend</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter friend's email"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            className="flex-grow p-2 border rounded text-black"
          />
          <button
            onClick={sendFriendRequest}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </section>

      {/* Friend Requests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          Friend Requests ({friendRequests.length})
        </h2>
        {friendRequests.length === 0 ? (
          <p>No friend requests.</p>
        ) : (
          <ul>
            {friendRequests.map(({ id, from }) => (
              <li
                key={id}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded mb-2"
              >
                <span>{from}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(id, from)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Friends List */}
      <section>
        <h2 className="text-xl font-semibold mb-3">My Friends</h2>
        {loading ? (
          <p>Loading friends...</p>
        ) : friends.length === 0 ? (
          <p>You have no friends yet.</p>
        ) : (
          <ul>
            {friends.map(({ id, email }) => (
              <li
                key={id}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded mb-2"
              >
                <span>{email}</span>
                <button
                  onClick={() => removeFriend(id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FriendsPage;

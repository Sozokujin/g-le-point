import { collection, getDocs, query, where, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import useUserStore from '@/stores/userStore';
import { FirebaseUser, FriendRequest } from '@/types';
import { useFriendStore } from '@/stores/friendStore';
import useMarkerStore from '@/stores/markerStore';
import { use } from 'react';
export const getAllFriends = async () => {
    try {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) {
            return [];
        }
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('uid', '==', currentUser.uid));

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.error('Utilisateur introuvable');
            return [];
        }

        const friendsUid = querySnapshot.docs[0].data().friends;
        if (friendsUid.length === 0) {
            console.warn('No friends found');
            return [];
        }

        const q2 = query(usersCollectionRef, where('uid', 'in', friendsUid));
        const querySnapshot2 = await getDocs(q2);

        const friends = querySnapshot2.docs.map((doc) => doc.data());
        return friends as FirebaseUser[];
    } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
    }
};

export const sendFriendRequest = async (invitationCode: string | null) => {
    if (!invitationCode) {
        throw new Error("Code d'invitation non fourni");
    }

    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('invitationCode', '==', invitationCode));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        throw new Error('Utilisateur introuvable');
    }

    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser?.uid) {
        throw new Error('Utilisateur non authentifié');
    }

    const friendUid = querySnapshot.docs[0].data().uid;
    // Check if they are already friends
    if (currentUser.friends.includes(friendUid)) {
        throw new Error('Cet utilisateur est déjà votre ami');
    }

    // Check if a friend request already exists
    const friendRequestRef = collection(db, 'friendRequests');
    const existingRequestQuery = query(
        friendRequestRef,
        where('from', '==', currentUser.uid),
        where('to', '==', friendUid),
        where('status', '==', 'pending')
    );
    const existingRequestSnapshot = await getDocs(existingRequestQuery);

    if (!existingRequestSnapshot.empty) {
        throw new Error("Une demande d'ami a déjà été envoyée à cet utilisateur");
    }

    const docRef = await addDoc(friendRequestRef, {
        from: currentUser.uid,
        to: friendUid,
        status: 'pending'
    });

    return docRef.id;
};

export const getFriendRequests = async (): Promise<FriendRequest[]> => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
        console.error('User not authenticated');
        return [];
    }

    const friendRequestsCollectionRef = collection(db, 'friendRequests');
    const q = query(friendRequestsCollectionRef, where('to', '==', currentUser.uid), where('status', '==', 'pending'));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data()
        })) as FriendRequest[];
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        return [];
    }
};

export const acceptFriendRequest = async (from: string) => {
    const currentUser = useUserStore.getState().currentUser;

    if (!currentUser?.uid) return;

    const friendRequestsCollectionRef = collection(db, 'friendRequests');
    const q = query(
        friendRequestsCollectionRef,
        where('from', '==', from),
        where('to', '==', currentUser.uid),
        where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return console.warn('Demande introuvable');

    const docId = querySnapshot.docs[0].id;

    await updateDoc(doc(friendRequestsCollectionRef, docId), {
        status: 'accepted'
    });

    const usersCollectionRef = collection(db, 'users');

    // Requête pour trouver le document de l'utilisateur actuel par son UID
    const currentUserQuery = query(usersCollectionRef, where('uid', '==', currentUser.uid));
    const currentUserSnapshot = await getDocs(currentUserQuery);

    let currentUserDocRef;
    if (!currentUserSnapshot.empty) {
        currentUserDocRef = doc(usersCollectionRef, currentUserSnapshot.docs[0].id);
    } else {
        console.error("Aucun document trouvé pour l'utilisateur actuel.");
        return;
    }

    const friendUserQuery = query(usersCollectionRef, where('uid', '==', from));
    const friendUserSnapshot = await getDocs(friendUserQuery);

    let friendUserDocRef;
    if (!friendUserSnapshot.empty) {
        friendUserDocRef = doc(usersCollectionRef, friendUserSnapshot.docs[0].id);
    } else {
        console.error("Aucun document trouvé pour l'ami.");
        return;
    }

    await updateDoc(currentUserDocRef, {
        friends: arrayUnion(from)
    });

    await updateDoc(friendUserDocRef, {
        friends: arrayUnion(currentUser.uid)
    });
};

export const declineFriendRequest = async (from: string) => {
    const currentUser = useUserStore.getState().currentUser;

    if (!currentUser?.uid) return;

    const friendRequestsCollectionRef = collection(db, 'friendRequests');
    const q = query(
        friendRequestsCollectionRef,
        where('from', '==', from),
        where('to', '==', currentUser.uid),
        where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return console.warn('Demande introuvable');

    const docId = querySnapshot.docs[0].id;

    await updateDoc(doc(friendRequestsCollectionRef, docId), {
        status: 'declined'
    });
};

export const unfriend = async (friendId: string) => {
    const currentUser = useUserStore.getState().currentUser;

    if (!currentUser?.uid) return;

    const usersCollectionRef = collection(db, 'users');

    const currentUserQuery = query(usersCollectionRef, where('uid', '==', currentUser.uid));
    const currentUserSnapshot = await getDocs(currentUserQuery);

    let currentUserDocRef;
    if (!currentUserSnapshot.empty) {
        currentUserDocRef = doc(usersCollectionRef, currentUserSnapshot.docs[0].id);
    } else {
        console.error("Aucun document trouvé pour l'utilisateur actuel.");
        return;
    }

    const friendUserQuery = query(usersCollectionRef, where('uid', '==', friendId));
    const friendUserSnapshot = await getDocs(friendUserQuery);

    let friendUserDocRef;
    if (!friendUserSnapshot.empty) {
        friendUserDocRef = doc(usersCollectionRef, friendUserSnapshot.docs[0].id);
    } else {
        console.error("Aucun document trouvé pour l'ami.");
        return;
    }

    await updateDoc(currentUserDocRef, {
        friends: arrayRemove(friendId)
    });

    await updateDoc(friendUserDocRef, {
        friends: arrayRemove(currentUser.uid)
    });

    useFriendStore.getState().removeFriend(friendId);
    useMarkerStore.getState().clearFriendsMarkers();
};

export const getInvitationCode = async () => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('uid', '==', currentUser.uid));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return console.warn('Utilisateur introuvable');

    return querySnapshot.docs[0].data().invitationCode;
};

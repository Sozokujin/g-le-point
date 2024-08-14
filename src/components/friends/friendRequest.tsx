import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { sendFriendRequest, getInvitationCode, acceptFriendRequest, declineFriendRequest } from "@/services/firebase/friends";
import { useEffect, useRef, useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useFriendRequestStore } from "@/stores/friendStore";
import  Popup  from "../popup";

export const FriendRequest = () => {

  const { friendRequests, getFriendRequests } = useFriendRequestStore();

  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [showPopupCopy, setShowPopupCopy] = useState(false);
  const [showPopupSend, setShowPopupSend] = useState(false);

  const invitationCodeRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if(friendRequests.length === 0) {
        getFriendRequests();
    }
}, [getFriendRequests]);

  useEffect(() => {
    const fetchInvitationCode = async () => {
      const cachedCode = localStorage.getItem('invitationCode');
      
      if (cachedCode) {
        setInvitationCode(cachedCode);
      } else {
        const code = await getInvitationCode();
        setInvitationCode(code);
        localStorage.setItem('invitationCode', code);
      }
    };

    const fetchFriendRequests = async () => {
      await getFriendRequests();
    };
    
    fetchFriendRequests();
    fetchInvitationCode();
  }, []);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode || '');
    setShowPopupCopy(true);
    setTimeout(() => {
      setShowPopupCopy(false);
    }, 3000);
  }

  const handleSendFriendRequest = async (invitationCode: string | undefined) => {
    await sendFriendRequest(invitationCode);
    setShowPopupSend(true);
    setTimeout(() => {
      setShowPopupSend(false);
    }, 3000);
  }


    return (
      <div>
        <Card className="p-4 flex flex-col gap-4">
        <Label htmlFor="invitationCode">Ajouter un ami</Label>
        <Input
          ref={invitationCodeRef}
          placeholder="Entrez le code d'invitation de votre ami"
          id="invitationCode"
          type="text"
        />
        <Button onClick={() => handleSendFriendRequest(invitationCodeRef.current?.value)}>Envoyer la demande</Button>

        <span>Mon code : <span className="text-glp-green font-bold">{invitationCode}</span><ClipboardDocumentIcon className="cursor-pointer ml-2 inline-block h-4 text-glp-green" onClick={() => copyToClipboard()}/></span>
      </Card>
      <h2 className="text-primary text-xl font-bold px-2 py-4">Demandes d&apos;amis</h2>
      <ul className="flex gap-3"></ul>
        {friendRequests.length !== 0 ? (
          friendRequests.map((friendRequest, key) => {
            return (
              <FriendRequestLine key={key} friendRequest={friendRequest} />
            );
          })
        ) : (
          <div>
            <p>Vous n&apos;avez pas de demandes d&apos;amis</p>
          </div>
        )}
          {showPopupCopy && <Popup message={"Code copié !"} duration={3000} />}
      </div>
      
    );
    }

const FriendRequestLine = ({ friendRequest }: { friendRequest: any }) => {

  const { removeFriendRequest, getFriendRequests } = useFriendRequestStore();

  const handleAcceptFriendRequest = async (uid: string) => {
    await acceptFriendRequest(uid);
    removeFriendRequest(friendRequest);
  }

  const handleDeclineFriendRequest = async (uid: string) => {
    await declineFriendRequest(uid);
    await getFriendRequests();
    removeFriendRequest(friendRequest);
  }

  return (
    <li className="h-24 w-full border-primary border-y-2 p-2 rounded-sm">
      <span className="text-primary font-semibold">{friendRequest.displayName}</span>
      <Button onClick={() => handleAcceptFriendRequest(friendRequest.uid)} className="bg-glp-green text-white">Accepter</Button>
      <Button onClick={() => handleDeclineFriendRequest(friendRequest.uid)} className="bg-red-500 text-white">Refuser</Button>
    </li>
  );
}
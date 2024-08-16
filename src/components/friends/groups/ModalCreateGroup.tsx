import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {SelectableFriendLine } from "../friendList";
import { useEffect } from "react";
import { FirebaseUser } from "@/types";
import { createGroup } from "@/services/firebase/groups";
import { useFriendStore } from "@/stores/friendStore";

export const ModalCreateGroup = () => {

    const { friends , getFriends } = useFriendStore();

    useEffect(() => {
        if(friends.length === 0) {
            getFriends();
        }
    }, [getFriends]);

    const [selectedFriends, setSelectedFriends] = useState<FirebaseUser[]>([]); // Gère la sélection des amis
    const [groupName, setGroupName] = useState<string>("");

    const toggleFriendSelection = (friend: FirebaseUser) => {
        setSelectedFriends((prevSelected) => {
            if (prevSelected.includes(friend)) {
                return prevSelected.filter((selected) => selected !== friend);
            } else {
                return [...prevSelected, friend];
            }
        });
    };

    useEffect(() => {
        console.log("Amis :", selectedFriends);
    }, [selectedFriends]);


    const createGroupHandler = async () => {
        const selectedFriendsUids = selectedFriends.map((friend) => {
            return friend.uid;
        });
        setSelectedFriends([]);
        await createGroup(groupName, selectedFriendsUids);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="btn btn-primary">Créer un groupe</Button>
            </DialogTrigger>
            <DialogContent>
                <div className="flex flex-col gap-2">
                    <h2 className="text-primary text-xl font-bold">Créer un groupe</h2>
                    <Input
                        type="text"
                        placeholder="Nom du groupe"
                        className="input"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <h3 className="text-primary text-lg font-bold">Sélectionner des amis</h3>
                    <ul>
                        {friends.length !== 0 ? (
                            friends.map((friend, index) => (
                                <SelectableFriendLine
                                    key={index}
                                    friend={friend}
                                    selected={selectedFriends.includes(friend)}
                                    onSelect={() => toggleFriendSelection(friend)}
                                />
                            ))
                        ) : (
                            <p>Vous n'avez pas d'amis.</p>
                        )}
                    </ul>

                    <DialogClose asChild>
                        <Button className="btn btn-primary" onClick={() => createGroupHandler()}>
                            Créer
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};
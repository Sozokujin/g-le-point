"use client";
import LeaderboardBanners from "@/components/leaderboard/leaderboardBanner";
import LeaderboardList from "@/components/leaderboard/leaderboardList";
import LeaderboardProfile from "@/components/leaderboard/leaderboardProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useUserStore from "@/stores/userStore";
import { FirebaseUser } from "@/types";
import { useEffect, useState } from "react";

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const {
    currentUser,
    topUsersByScore,
    fetchUserByScores,
    topFriendsUsersByScore,
    fetchFriendsUserByScores,
  } = useUserStore();

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUserByScores();
      if (currentUser) {
        await fetchFriendsUserByScores(currentUser.uid);
      }
      setLoading(false);
    };

    loadUsers();
  }, [fetchUserByScores, fetchFriendsUserByScores, currentUser]);

  const topUsers: FirebaseUser[] = topUsersByScore.slice(0, 3);
  const otherUsers: FirebaseUser[] = topUsersByScore.slice(3);

  const topFriends: FirebaseUser[] = topFriendsUsersByScore.slice(0, 3);
  const otherFriends: FirebaseUser[] = topFriendsUsersByScore.slice(3);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="w-full min-h-[100svh]">
      <Tabs
        defaultValue="global"
        className="w-full flex flex-col justify-center"
      >
        <TabsList className="w-auto mx-auto mt-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="amis">Amis</TabsTrigger>
        </TabsList>
        <TabsContent
          value="global"
          className="w-2/3 mx-auto  flex flex-col justify-center items-center"
        >
          <h2>Classement Global</h2>
          <LeaderboardBanners players={topUsers} />
          <LeaderboardList players={otherUsers} />
          <LeaderboardProfile />
        </TabsContent>
        <TabsContent
          value="amis"
          className="w-2/3 mx-auto  flex flex-col justify-center items-center"
        >
          <h2>Classement Amis</h2>
          <LeaderboardBanners players={topFriends} />
          <LeaderboardList players={otherFriends} />
          <LeaderboardProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;

import React from 'react';
import { client } from '../client';
import { useAddress } from '@thirdweb-dev/react'; 

import {
  useSocialProfiles,
  useActiveAccount,
} from "thirdweb/react";

const ProfileCard = () => {
    const address = useAddress();

    if (!address) {
        return <div>Please connect your wallet.</div>;
      }
    
      // Fetch additional profile data based on the address if needed
    
      return (
        <div className="profile-card">
          <p>Wallet Address: {address}</p>
          {/* Display additional profile information here */}
        </div>
      );
    };
    
export default ProfileCard;
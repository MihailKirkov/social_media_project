import React, { useState } from 'react'
import {Dialog} from 'primereact/dialog';
import { Button } from 'primereact/button';
import LinkedInAuth from '../components/social-media-components/LinkedInAuth';

const AddPageMenu = ({ visible, setVisible }) => {
    const [isLinkedInAuthVisible, setIsLinkedInAuthVisible] = useState(false);
    const [isFaceBookAuthVisible, setIsFaceBookAuthVisible] = useState(false);
    const [isInstagramAuthVisible, setIsInstagramAuthVisible] = useState(false);
    const [isTwitterAuthVisible, setIsTwitterAuthVisible] = useState(false);
    const [isYouTubeAuthVisible, setIsYouTubeAuthVisible] = useState(false);
    const [isTikTokAuthVisible, setIsTikTokAuthVisible] = useState(false);
  
    return (
      <Dialog header="Add Page" visible={visible} style={{ width: '50dvw', maxHeight:'50dvh' }} onHide={() => setVisible(false)}>
        <div className='top-row flex ai-center jc-space-around' style={{gap:'10px'}}>
            <Button icon='pi pi-facebook' severity='info' rounded text aria-label='facebook' title='FaceBook' pt={{icon: {style: {fontSize:'30px'}}}} onClick={() => {}}/>
            <Button icon='pi pi-instagram' severity='warning' rounded text aria-label='instagram' title='Instagram' pt={{icon: {style: {fontSize:'30px'}}}} onClick={() => {}}/>
            <Button icon='pi pi-linkedin' rounded text aria-label='linkedin' title='Linkedin' pt={{icon: {style: {fontSize:'30px'}}}} onClick={() => setIsLinkedInAuthVisible(true)}/>
            <Button icon='pi pi-twitter' severity='secondary' rounded text aria-label='twitter' title='Twitter' pt={{icon: {style: {fontSize:'30px'}}}} onClick={() => {}}/>
            <Button icon='pi pi-youtube' severity='danger' rounded text aria-label='youtube' title='YouTube' pt={{icon: {style: {fontSize:'30px'}}}} onClick={() => {}}/>
            <Button icon='pi pi-whatsapp' severity='secondary' rounded text aria-label='tiktok' title='TikTok' pt={{icon: {style: {fontSize:'30px'}}}} onClick={() => {}}/>
        </div>
        {isLinkedInAuthVisible &&  <LinkedInAuth/> }
        {/* {isLinkedInAuthVisible &&  <LinkedInAuth/> }
        {isLinkedInAuthVisible &&  <LinkedInAuth/> }
        {isLinkedInAuthVisible &&  <LinkedInAuth/> }
        {isLinkedInAuthVisible &&  <LinkedInAuth/> }
        {isLinkedInAuthVisible &&  <LinkedInAuth/> } */}
      </Dialog>
    );
  }

export default AddPageMenu
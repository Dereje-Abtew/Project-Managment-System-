import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';

import { API_BASE_URL } from '@/config/serverConfig';

import ProjectCard from '@/components/ProjectCard';
import ProjectCarousel from '@/components/ProjectList';
import AppFooter from '@/pages/Footer';
import AppHeader from '@/pages/Header';
import signatureGenerator from '@/utils/hashSignature';
import getCurrentTime from '@/utils/helpers/getCurrentTime';

const GuestPage = () => {
  document.title = 'Home - PMS';

  const [loading, setLoading] = useState(true);
  axios.defaults.baseURL = API_BASE_URL;

  // const token = process.env.REACT_APP_AUTH_TOKEN;
  // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const [projects, setProjects] = useState([]);
  const isMounted = React.useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const projectData = () => {
    const current = getCurrentTime();
    const signature = signatureGenerator.CreateSignature(current);
    
    axios.post('/public/projects', { _1: signature, _2: current })
      .then((res) => {
        if (isMounted.current) {
          setProjects(res.data.result);
          setTimeout(() => {
            if (isMounted.current) setLoading(false);
          }, 1000);
        }
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        if (isMounted.current) setLoading(false);
      });
  };

  useEffect(() => {
    projectData();
  }, []);
  const currentPage = 'home';

  return (
    <>
      <AppHeader currentPage={currentPage} />
      <div className="m-3 h-screen pt-16 mb-100 sm:mb-80 md:mb-36 lg:mb-30 xl:mb-24">
        <ProjectCarousel projects={projects} isFromGuest={true} loading={loading} />
        <ProjectCard projects={projects} loading={loading} />
      </div>
      <AppFooter isLoggedIn={false} />
    </>
  );
};

export default GuestPage;

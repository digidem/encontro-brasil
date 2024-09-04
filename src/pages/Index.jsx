import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Loader from '@/components/Loader';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Info from '@/components/Info';
import Chronogram from '@/components/Chronogram';
import Participants from '@/components/Participants';
import PastEditions from '@/components/PastEditions';
import Footer from '@/components/Footer';

const fetchMarkdownContent = async (file) => {
  const response = await fetch(file);
  return response.text();
};

const extractMetaData = (text) => {
  const metaRegex = /^---\n([\s\S]*?)\n---/;
  const match = text.match(metaRegex);
  if (!match) return [null, {}];
  const rawMeta = match[0];
  const metaText = match[1];
  const metaData = {};
  metaText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':').map(part => part.trim());
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      metaData[key] = value;
    }
  });
  return [rawMeta, metaData];
};

const extractGalleryItems = (markdown) => {
  const regex = /^(?:##\s(.+)|!\[(.+?)\]\((.+?)\)|<iframe.*?src="(.+?)".*?title="(.+?)".*?><\/iframe>)/gm;
  const matches = [...markdown.matchAll(regex)];
  return matches.map(match => {
    if (match[1]) {
      return { type: 'title', content: match[1] };
    } else if (match[2] && match[3]) {
      return { type: 'image', alt: match[2], src: match[3] };
    } else if (match[4] && match[5]) {
      return { type: 'video', src: match[4], title: match[5] };
    }
  }).filter(Boolean);
};

const Index = () => {
  const [eventoInfoMarkdown, setEventoInfoMarkdown] = useState("");
  const [eventoInfoMetaData, setEventoInfoMetaData] = useState({});
  const [cronogramaMarkdown, setCronogramaMarkdown] = useState("");
  const [cronogramaMetaData, setCronogramaMetaData] = useState({});
  const [participantsMarkdown, setParticipantsMarkdown] = useState("");
  const [pastEditionsMarkdown, setPastEditionsMarkdown] = useState("");
  const [pastEditionsMetaData, setPastEditionsMetaData] = useState({});

  const { data: eventoInfo, isLoading: isLoadingEventoInfo } = useQuery({
    queryKey: ['eventoInfo'],
    queryFn: () => fetchMarkdownContent('/conteudo/evento-info.md'),
  });

  const { data: cronograma, isLoading: isLoadingCronograma } = useQuery({
    queryKey: ['cronograma'],
    queryFn: () => fetchMarkdownContent('/conteudo/cronograma.md'),
  });

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['participants'],
    queryFn: () => fetchMarkdownContent('/conteudo/participantes.md'),
  });

  const { data: pastEditions, isLoading: isLoadingPastEditions } = useQuery({
    queryKey: ['pastEditions'],
    queryFn: () => fetchMarkdownContent('/conteudo/edicoes-anteriores.md'),
  });
  useEffect(() => {
    if (eventoInfo) {
      const [rawMeta, metaData] = extractMetaData(eventoInfo);
      setEventoInfoMetaData(metaData);
      setEventoInfoMarkdown(eventoInfo.replace(rawMeta, ""));
    }
  }, [eventoInfo]);

  useEffect(() => {
    if (cronograma) {
      const [rawMeta, metaData] = extractMetaData(cronograma);
      setCronogramaMetaData(metaData);
      setCronogramaMarkdown(cronograma.replace(rawMeta, ""));
    }
  }, [cronograma]);

  useEffect(() => {
    if (participants) {
      setParticipantsMarkdown(participants);
    }
  }, [participants]);

  useEffect(() => {
    if (pastEditions) {
      const [rawMeta, metaData] = extractMetaData(pastEditions);
      setPastEditionsMetaData(metaData);
      const contentWithoutMeta = pastEditions.replace(rawMeta, "").trim();
      setPastEditionsMarkdown(contentWithoutMeta);
      const galleryItems = extractGalleryItems(contentWithoutMeta);
      setPastEditionsMetaData(prevState => ({...prevState, gallery: galleryItems}));
    }
  }, [pastEditions]);

  if (isLoadingEventoInfo || isLoadingCronograma || isLoadingParticipants || isLoadingPastEditions) {
    return <div className="flex justify-center items-center h-screen bg-[#FFF5E1]">
      <Loader />
    </div>;
  }

  function smoothScroll (to) {
    document.querySelector(`#${to}`).scrollIntoView({
      behavior: 'smooth'
    });
  }

  const cronogramaItems = cronogramaMarkdown.split('\n## ').slice(1);
  console.log(eventoInfoMetaData)
  return (
    <div className="min-h-screen bg-[#FFF5E1] text-[#1E3D59]">
      <NavBar onSmoothScroll={smoothScroll} />

      <main className="pt-40 container mx-auto px-4 py-12">
        <Hero
          title={eventoInfoMetaData.title}
          title2={eventoInfoMetaData.title_2}
          subTitle={eventoInfoMetaData.subTitle}
          subTitle2={eventoInfoMetaData.subTitle2}
          onSmoothScroll={smoothScroll}
        />
        <Info
          data={eventoInfoMetaData.data}
          local={eventoInfoMetaData.local}
          localMedia={eventoInfoMetaData.localMedia}
          markdown={eventoInfoMarkdown}
        />
        <Chronogram cronogramaItems={cronogramaItems} />
        <Participants 
          participantsData={participantsMarkdown.split('\n## ').slice(1)} 
          title={participantsMarkdown.split('\n')[0].replace('# ', '')}
        />
        <PastEditions
          markdown={pastEditionsMarkdown}
          metaData={pastEditionsMetaData}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

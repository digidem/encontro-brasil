import React, { useRef, useEffect } from 'react';
import { useNotionBlocks, useMarkdownData } from '@/lib/api';
import { useMarkdownProcessor, useActiveSection } from '@/lib/hooks';
import { smoothScroll, extractEventInformation } from '@/lib/utils';
import Loader from '@/components/Loader';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Info from '@/components/Info';
import Schedule from '@/components/Schedule';
import Participants from '@/components/Participants';
import MediaGallery from '@/components/MediaGallery';
import Footer from '@/components/Footer';

const Index = () => {
  const sectionRefs = {
    information: useRef(null),
    schedule: useRef(null),
    participants: useRef(null),
    gallery: useRef(null),
  };

  const { data: notionBlocks, isLoading: isLoadingNotionBlocks } = useNotionBlocks();
  const { data: markdownData, isLoading: isLoadingMarkdown } = useMarkdownData(notionBlocks);
  const { markdownContents, metaData } = useMarkdownProcessor(markdownData);
  const activeSection = useActiveSection(Object.values(sectionRefs));

  useEffect(() => {
    // Forçar uma reavaliação do activeSection quando o conteúdo for carregado
    if (!isLoadingNotionBlocks && !isLoadingMarkdown) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoadingNotionBlocks, isLoadingMarkdown]);

  if (isLoadingNotionBlocks || isLoadingMarkdown) {
    return <div className="flex justify-center items-center h-screen bg-[#FFF5E1]">
      <Loader />
    </div>;
  }

  const scheduleTitle = markdownContents['Event Schedule']?.split('\n').find(line => line.startsWith('#'))?.replace(/^#+\s*/, '').trim();
  const scheduleItems = markdownContents['Event Schedule']?.split('\n\n**').slice(1).map(item => `**${item}`);

  const eventInfo = extractEventInformation(markdownContents['Event Information'] || '');

  return (
    <div className="min-h-screen bg-[#FFF5E1] text-[#1E3D59]">
      <NavBar onSmoothScroll={smoothScroll} activeSection={activeSection} />
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/background.mp4"
        type="video/mp4"
        autoPlay
        loop
        muted
      />
      <div className="absolute top-0 left-0 w-full h-full bg-[#FFF5E1] opacity-90"></div>

      <main className="container mx-auto px-4 py-12">
        <div className='relative z-10 my-48'>
          <Hero
            title={eventInfo.title}
            title2={eventInfo.title2}
            subTitle={eventInfo.subTitle}
            logos={eventInfo.logos}
            onSmoothScroll={smoothScroll}
          />
        </div>
        <div className="relative w-full h-12 mt-12">
          <div className="absolute left-0 w-1/2 h-full bg-[#FFF5E1] clip-triangle-left"></div>
          <div className="absolute right-0 w-1/2 h-full bg-[#FFF5E1] clip-triangle-right"></div>
        </div>

        {
          markdownContents['Event Information'] && (
            <div id="information" className='pt-20' ref={sectionRefs.information}>
              <Info content={markdownContents['Event Information']} />
            </div>
          )
        }
        {
          scheduleTitle && scheduleItems && (
            <div id="schedule" ref={sectionRefs.schedule}>
              <Schedule title={scheduleTitle} scheduleItems={scheduleItems} />
            </div>
          )
        }
        {
          metaData.Participants && markdownContents.Participants && (
            <div id="participants" ref={sectionRefs.participants} className="min-h-screen">
              <Participants
                markdownContent={markdownContents.Participants}
              />
            </div>
          )
        }
        {
          markdownContents.Gallery && metaData.Gallery && (
            <div id="gallery" ref={sectionRefs.gallery}>
              <MediaGallery
                markdown={markdownContents.Gallery}
                metaData={{
                  ...metaData.Gallery,
                  title: metaData.Gallery.title || "Galeria da Edição Anterior"
                }}
              />
            </div>
          )
        }
      </main >

      <Footer />
    </div >
  );
};

export default Index;

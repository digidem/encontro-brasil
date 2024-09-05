import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const MediaGallery = ({ markdown, metaData }) => {
  const galleryItems = metaData?.gallery || [];
  const [currentItem, setCurrentItem] = useState(null);

  const openDialog = (item) => setCurrentItem(item);
  const closeDialog = () => setCurrentItem(null);

  const navigateGallery = (direction) => {
    const currentSection = galleryItems.find(section => 
      section.items.some(item => item === currentItem)
    );
    const currentIndex = currentSection.items.indexOf(currentItem);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % currentSection.items.length 
      : (currentIndex - 1 + currentSection.items.length) % currentSection.items.length;
    setCurrentItem(currentSection.items[newIndex]);
  };

  return (
    <section id="gallery" className="py-16 bg-[#F5E6D3]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 text-center">{metaData.title}</h2>
        
        {galleryItems.length > 0 ? (
          <div className="space-y-16">
            {galleryItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
                <h3 className="text-3xl font-bold mb-6 text-center">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-w-16 aspect-h-9">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="object-cover w-full h-full cursor-pointer" onClick={() => openDialog(item)} />
                        ) : item.video ? (
                          <iframe src={item.video} title={item.title} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        ) : null}
                      </div>
                      <div className="p-4">
                        <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                        <Button onClick={() => openDialog(item)} variant="outline" className="mt-2">Ver mais</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xl">Nenhum item de galeria disponível.</p>
        )}
      </div>

      <Dialog open={!!currentItem} onOpenChange={closeDialog}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{currentItem?.title}</h3>
                <Button variant="ghost" onClick={closeDialog}><X /></Button>
              </div>
              <div className="aspect-w-16 aspect-h-9 mb-4">
                {currentItem?.image ? (
                  <img src={currentItem.image} alt={currentItem.title} className="object-contain w-full h-full" />
                ) : currentItem?.video ? (
                  <iframe src={currentItem.video} title={currentItem.title} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                ) : null}
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentItem?.content }}></div>
            </div>
            <div className="flex justify-between p-4 bg-gray-100">
              <Button onClick={() => navigateGallery('prev')} variant="outline"><ChevronLeft className="mr-2" /> Anterior</Button>
              <Button onClick={() => navigateGallery('next')} variant="outline">Próximo <ChevronRight className="ml-2" /></Button>
            </div>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default MediaGallery;

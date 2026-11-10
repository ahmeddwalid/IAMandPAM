import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {SERIES} from '../data/videos';

const LABELS = {
  en: {
    episodes: 'Episodes',
    readSection: 'Read the section',
    arabic: 'Arabic',
    episode: 'Episode',
  },
  ar: {
    episodes: 'الحلقات',
    readSection: 'اقرأ القسم',
    arabic: 'بالعربية',
    episode: 'الحلقة',
  },
};

export default function VideoSeries() {
  const {i18n} = useDocusaurusContext();
  const isAr = i18n.currentLocale === 'ar';
  const t = isAr ? LABELS.ar : LABELS.en;
  const [active, setActive] = useState(0);
  const video = SERIES[active];

  const title = isAr ? video.titleAr : video.title;
  const description = isAr ? video.descriptionAr : video.description;
  const sectionLabel = isAr ? video.section.labelAr : video.section.label;

  return (
    <div className="video-series">
      <div className="video-series__stage">
        <video
          key={video.slug}
          controls
          preload="none"
          playsInline
          poster={`/videos/series/${video.slug}.jpg`}
          className="video-series__player"
        >
          <source src={`/videos/series/${video.slug}.mp4`} type="video/mp4" />
        </video>

        <div className="video-series__caption">
          <h2 className="video-series__title">{title}</h2>
          <p className="video-series__text">{description}</p>
          <div className="video-series__meta">
            <span>{video.duration}</span>
            <span aria-hidden="true">·</span>
            <Link to={video.section.to}>{sectionLabel}</Link>
          </div>
        </div>
      </div>

      <div className="video-series__rail">
        <h2 className="video-series__rail-heading">{t.episodes}</h2>
        <ol className="video-series__list">
          {SERIES.map((item, index) => {
            const isActive = index === active;
            const itemTitle = isAr ? item.titleAr : item.title;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  className={
                    isActive
                      ? 'video-series__item video-series__item--active'
                      : 'video-series__item'
                  }
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActive(index)}
                >
                  <span className="video-series__index">{index + 1}</span>
                  <span className="video-series__item-body">
                    <span className="video-series__item-title">{itemTitle}</span>
                    <span className="video-series__item-meta">
                      {item.duration}
                      {item.language === 'ar' ? ` · ${t.arabic}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

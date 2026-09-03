import React, { useState, type ReactNode } from "react";
import type { MediaAsset, PortfolioData, Project } from "../model.js";

const sectionLabels = {
  background: "项目背景",
  problem: "关键问题",
  action: "我的行动",
  result: "项目成果",
};

function mediaUrl(path: string): string {
  return `./${path.replace(/^\/+/, "")}`;
}

function Figure({ media }: { media: MediaAsset }) {
  return (
    <figure className={`project-figure project-figure--${media.kind}`}>
      <img src={mediaUrl(media.path)} alt={media.alt} loading="lazy" />
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}

function ProjectStory({ project, media }: { project: Project; media: Map<string, MediaAsset> }) {
  const [open, setOpen] = useState(false);
  const hero = project.heroMediaId ? media.get(project.heroMediaId) : undefined;

  return (
    <article className="project-card" id={project.id}>
      <div className="project-card__summary">
        <div>
          <p className="eyebrow">{project.period ?? "Selected project"}</p>
          <h3>{project.title}</h3>
          <p className="project-role">{project.role}</p>
          <p>{project.summary}</p>
          <ul className="tag-list" aria-label={`${project.title} 使用工具`}>
            {project.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </div>
        {hero ? <Figure media={hero} /> : null}
      </div>
      <button
        className="detail-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={`${project.id}-story`}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "收起" : "查看"}{project.title}详情
      </button>
      <div id={`${project.id}-story`} className="project-story" hidden={!open}>
        {project.sections.map((section, index) => (
          <section className="story-block" key={`${section.kind}-${index}`}>
            <div className="story-block__copy">
              <p className="story-index">0{index + 1}</p>
              <h4>{section.title ?? sectionLabels[section.kind]}</h4>
              <p>{section.text}</p>
            </div>
            {(section.mediaIds ?? []).map((id) => {
              const asset = media.get(id);
              return asset ? <Figure media={asset} key={id} /> : null;
            })}
          </section>
        ))}
      </div>
    </article>
  );
}

function Timeline({ title, items }: { title: string; items: PortfolioData["education"] }) {
  if (items.length === 0) return null;
  return (
    <section className="page-section timeline-section" aria-labelledby={`${title}-title`}>
      <div className="section-heading"><p className="eyebrow">Profile / 02</p><h2 id={`${title}-title`}>{title}</h2></div>
      <div className="timeline">
        {items.map((item) => (
          <article key={item.id} className="timeline-item">
            <time>{item.period}</time>
            <div><h3>{item.organization}</h3><p>{item.title}</p>{item.details.map((detail) => <p key={detail}>{detail}</p>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PortfolioLayout({
  data,
  template,
  masthead,
}: {
  data: PortfolioData;
  template: string;
  masthead?: ReactNode;
}) {
  const media = new Map(data.media.map((asset) => [asset.id, asset]));
  const publishedEmail = data.profile.publication?.email ? data.profile.email : undefined;
  const publishedPhone = data.profile.publication?.phone ? data.profile.phone : undefined;
  const publishedLocation = data.profile.publication?.location ? data.profile.location : undefined;

  return (
    <div className="portfolio" data-template={template}>
      <div className="loading-mark" aria-hidden="true"><span>EP</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">{data.profile.name}</a>
        <nav aria-label="主导航">
          <a href="#about">关于</a><a href="#projects">项目</a><a href="#capabilities">能力</a><a href="#contact">联系</a>
        </nav>
      </header>
      <main id="top">
        <section className="hero page-section">
          <div>{masthead}<p className="eyebrow">Mechanical / Structural / Verification</p><h1>{data.profile.title}</h1><p className="hero__summary">{data.profile.summary}</p><a className="primary-action" href="#projects">浏览项目</a></div>
          <div className="hero__signal" aria-hidden="true"><span>01</span><i /><span>ENGINEERING</span></div>
        </section>

        <section className="page-section about" id="about" aria-labelledby="about-title">
          <div className="section-heading"><p className="eyebrow">Profile / 01</p><h2 id="about-title">关于我</h2></div>
          <div className="about__grid"><p>{data.profile.summary}</p><dl><div><dt>方向</dt><dd>{data.profile.title}</dd></div>{publishedLocation ? <div><dt>地点</dt><dd>{publishedLocation}</dd></div> : null}<div><dt>项目</dt><dd>{data.projects.length.toString().padStart(2, "0")}</dd></div></dl></div>
        </section>

        <Timeline title="教育经历" items={data.education} />
        <Timeline title="工作经历" items={data.experience} />

        <section className="page-section projects" id="projects" aria-labelledby="projects-title">
          <div className="section-heading"><p className="eyebrow">Selected / 03</p><h2 id="projects-title">精选项目</h2></div>
          <div className="project-list">{data.projects.map((project) => <ProjectStory project={project} media={media} key={project.id} />)}</div>
        </section>

        {(data.otherWork?.length ?? 0) > 0 ? (
          <section className="page-section other-work" aria-labelledby="other-title">
            <div className="section-heading"><p className="eyebrow">Archive / 04</p><h2 id="other-title">其他结构设计</h2></div>
            <div className="other-work__track">{data.otherWork?.map((item) => <article key={item.id}><p className="eyebrow">Concept</p><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div>
          </section>
        ) : null}

        {data.skills.length > 0 ? (
          <section className="page-section capabilities" id="capabilities" aria-labelledby="capabilities-title">
            <div className="section-heading"><p className="eyebrow">Capabilities / 05</p><h2 id="capabilities-title">专业能力</h2></div>
            <div className="capability-grid">{data.skills.map((skill) => <article key={skill.id}><span aria-hidden="true">{skill.id.slice(0, 1).toUpperCase()}</span><h3>{skill.label}</h3><p>{skill.items.join(" · ")}</p></article>)}</div>
          </section>
        ) : null}
      </main>
      <footer className="page-section contact" id="contact">
        <p className="eyebrow">Contact / 06</p><h2>让结构方案进入下一步</h2><p>欢迎交流机械结构、产品设计与工程验证机会。</p>
        <div className="contact-links">{publishedEmail ? <a href={`mailto:${publishedEmail}`}>{publishedEmail}</a> : null}{publishedPhone ? <a href={`tel:${publishedPhone}`}>{publishedPhone}</a> : null}</div>
      </footer>
    </div>
  );
}

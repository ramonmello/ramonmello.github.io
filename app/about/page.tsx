import Image from "next/image";

export default function About() {
  return (
    <div className="max-w-6xl scroll-smooth mt-16" id="about">
      <div className="lg:flex lg:justify-between lg:gap-4">
        <div className="lg:sticky lg:h-[calc(100vh-345px)] lg:flex lg:flex-col top-36 w-6/12">
          <Image
            src="/ramon-avatar.jpg"
            alt="Ramon Mello"
            width={250}
            height={250}
            className="mb-10 rounded-3xl "
          />
          <h1 className="font-bold text-5xl">Ramon Mello</h1>
          <p className="text-xl">Front-end Developer</p>
          <p className="mt-4 text-base text-neutral-400">
            I build accessible, pixel-perfect digital experiences for the web.
          </p>
          <nav className="mt-8">
            <ul className="space-y-2 uppercase font-lores-12">
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-300 transition-colors duration-300"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="hover:text-neutral-300 transition-colors duration-300"
                >
                  Experiência
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="hover:text-neutral-300 transition-colors duration-300"
                >
                  Projetos
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex gap-4 mt-auto">
            <a
              className="flex"
              href="https://github.com/ramonmello"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                className="text-amber-200 fill-amber-200"
                src="/github-icon.svg"
                alt="File icon"
                width={24}
                height={24}
              />
            </a>
            <a
              className="flex"
              href="https://www.linkedin.com/in/ramonmello/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/linkedin-icon.svg"
                alt="File icon"
                width={24}
                height={24}
              />
            </a>
          </div>
        </div>
        <div className="w-7/12 text-neutral-400">
          <section className="text-neutral-400">
            <p>
              I'm a developer passionate about crafting accessible,
              pixel-perfect user interfaces that blend thoughtful design with
              robust engineering. My favorite work lies at the intersection of
              design and development, creating experiences that not only look
              great but are meticulously built for performance and usability.
              Currently, I'm a Senior Front-End Engineer at Klaviyo,
              specializing in accessibility. I contribute to the creation and
              maintenance of UI components that power Klaviyo's frontend,
              ensuring our platform meets web accessibility standards and best
              practices to deliver an inclusive user experience. In the past,
              I've had the opportunity to develop software across a variety of
              settings — from advertising agencies and large corporations to
              start-ups and small digital product studios. Additionally, I also
              released a comprehensive video course a few years ago, guiding
              learners through building a web app with the Spotify API. In my
              spare time, I'm usually climbing, reading, hanging out with my
              wife and two cats, or running around Hyrule searching for Korok
              seeds K o r o k s e e d s .
            </p>
          </section>
          <section id="experience" className="mt-56 text-neutral-400">
            <h2>Experiência</h2>
            <div>
              <h3>Senior Front-End Engineer</h3>
              <p>Klaviyo</p>
              <p>2023 - Present</p>
            </div>
          </section>
          <section id="projects" className="mt-56 text-neutral-400">
            <h2>Projetos</h2>
            <div className="mt-8 flex flex-col gap-12">
              <div>
                <h3 className="text-xl font-medium text-white">Projeto 1</h3>
                <p className="mt-2">
                  Descrição do projeto 1 aqui. Explique brevemente o que foi
                  construído, tecnologias utilizadas e resultados alcançados.
                </p>
                <div className="mt-4 flex gap-4">
                  <a href="#" className="text-white hover:text-neutral-300">
                    Ver projeto
                  </a>
                  <a href="#" className="text-white hover:text-neutral-300">
                    GitHub
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-white">Projeto 2</h3>
                <p className="mt-2">
                  Descrição do projeto 2 aqui. Explique brevemente o que foi
                  construído, tecnologias utilizadas e resultados alcançados.
                </p>
                <div className="mt-4 flex gap-4">
                  <a href="#" className="text-white hover:text-neutral-300">
                    Ver projeto
                  </a>
                  <a href="#" className="text-white hover:text-neutral-300">
                    GitHub
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-white">Projeto 3</h3>
                <p className="mt-2">
                  Descrição do projeto 3 aqui. Explique brevemente o que foi
                  construído, tecnologias utilizadas e resultados alcançados.
                </p>
                <div className="mt-4 flex gap-4">
                  <a href="#" className="text-white hover:text-neutral-300">
                    Ver projeto
                  </a>
                  <a href="#" className="text-white hover:text-neutral-300">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Button } from "./button";

export const Contact = () => {
  return (
    <section id="contact" className="my-20 min-h-96 w-screen px-10">
      <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <p className="special-font mt-10 w-full font-zentry text-5xl leading-[0.9] md:text-[6rem]">
            Let&apos;s b<b>u</b>ild the
            <br /> new era of <br /> b<b>u</b>ilding t<b>o</b>gether
          </p>

          <Button containerClass="mt-10 cursor-pointer">Contact Us</Button>
        </div>
      </div>
    </section>
  );
};

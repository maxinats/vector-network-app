import svgPaths from "../../imports/svg-ymbvac59fu";
import imgVaibhavSisinty from "figma:asset/4036ae98f657a398b51d50beae8fd8c78d6b63ef.png";
import { imgGradient } from "../../imports/svg-vuxso";

function MaskGroup() {
  return (
    <div className="relative size-full" data-name="Mask Group">
      <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0%_0%] mask-size-[100%_100%]" data-name="Gradient" style={{ backgroundImage: "linear-gradient(90deg, rgba(255, 255, 255, 0.03) 2.0833%, rgba(255, 255, 255, 0) 2.0833%), linear-gradient(rgba(255, 255, 255, 0.03) 2.0833%, rgba(255, 255, 255, 0) 2.0833%)", maskImage: `url('${imgGradient}')` }} />
    </div>
  );
}

function Link() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
          <p className="leading-[24px]">Vector Network</p>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[16px] py-[6px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">Join the network</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative">
        <Button />
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div className="backdrop-blur-[6px] bg-gradient-to-r from-[#a0bdc4] h-[48px] relative rounded-[16px] shrink-0 to-[#74e1fc] w-full" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[17px] py-px relative size-full">
          <Link />
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function NavMainNavigation() {
  return (
    <div className="shrink-0 sticky top-0 w-full z-[2]" data-name="Nav - Main navigation">
      <div className="content-stretch flex flex-col items-start pt-[12px] px-[12px] relative w-full">
        <OverlayBorderOverlayBlur />
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(0,0,0,0.05)] content-stretch flex flex-col items-center px-[16px] py-[6px] relative rounded-[9999px] shrink-0" data-name="Overlay+Border">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Free· Builders and enthusiasts</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="max-w-[384px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center max-w-[inherit] pb-[2px] px-[22.02px] relative w-full">
          <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[16px] text-center w-[308px]">
            <p className="leading-[26px]">Join a curated network of builders and early adopters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaibhavSisinty() {
  return (
    <div className="h-[40.17px] pointer-events-none relative rounded-[8px] shrink-0 w-[40px]" data-name="Vaibhav Sisinty">
      <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[8px] size-full" src={imgVaibhavSisinty} />
      <div aria-hidden="true" className="absolute border border-[#1c1c1c] border-solid inset-0 rounded-[8px]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] whitespace-nowrap">
        <p className="leading-[17.5px]">Vector Network</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[12px] w-full">
        <p className="leading-[16px]">Where ambitions meet initiatives</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[106px]" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Container">
      <VaibhavSisinty />
      <Container4 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d="M5 7.5L10 12.5L15 7.5" id="Vector" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <Svg />
    </div>
  );
}

function Section() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[20px] items-center ml-0 mt-0 relative row-1 w-[358px]" data-name="Section">
      <OverlayBorder />
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#1c1c1c] text-[36px] text-center tracking-[-0.9px] w-[min-content]">
        <p className="leading-[40px]">Connect With Builders</p>
      </div>
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[20px] text-center whitespace-nowrap">
        <p className="leading-[28px]">Discover relevant people</p>
      </div>
      <Container2 />
      <Container3 />
      <Margin />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.p1aca3780} id="Vector" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p2b92b800} id="Vector_2" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Svg1 />
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">Your data is safe. No spam, ever.</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(136,136,136,0.6)] w-full">
          <p className="leading-[normal]">Email address</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[17px] py-[15px] relative w-full">
          <Container8 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#9fbec5] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function InputMargin() {
  return (
    <div className="content-stretch flex flex-col h-[18px] items-start pt-[2px] relative shrink-0 w-[16px]" data-name="Input:margin">
      <div className="bg-[#75e0fb] rounded-[2.5px] shrink-0 size-[16px]" data-name="Input" />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0" data-name="Paragraph">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[14px] whitespace-nowrap">
        <p>
          <span className="leading-[19.25px]">{`I agree with `}</span>
          <span className="[text-decoration-skip-ink:none] decoration-solid leading-[19.25px] underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Label">
      <InputMargin />
      <Paragraph />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#74e1fc] content-stretch flex items-center justify-center py-[14px] relative rounded-[9999px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">
        <p className="leading-[28px]">Get Access →</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[16px] text-center w-[308px]">
        <p>
          <span className="leading-[26px]">{`Already joined? `}</span>
          <span className="font-['Century_Gothic',sans-serif] font-bold leading-[26px] not-italic text-[#74e1fc]">Log in</span>
        </p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[16px] items-start ml-0 mt-[422px] relative row-1 w-[358px]">
      <Container7 />
      <Input />
      <Label />
      <Container9 />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Section />
      <Frame />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(116,225,252,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="User plus">
        <div className="absolute inset-[12.5%_4.17%]" data-name="Icon">
          <div className="absolute inset-[-5%_-4.09%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.8333 16.5">
              <path d={svgPaths.p2f4ea80} id="Icon" stroke="var(--stroke-0, #74E1FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Heading 4">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Discover builders</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] w-full">
        <p className="leading-[20px]">Browse profiles of people working on startups, products, and side projects.</p>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[20px] relative w-full">
        <Overlay />
        <Heading />
        <Container11 />
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(116,225,252,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Link">
        <div className="absolute inset-[8.61%_8.57%]" data-name="Icon">
          <div className="absolute inset-[-4.53%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0726 18.0559">
              <path d={svgPaths.pf346f00} id="Icon" stroke="var(--stroke-0, #74E1FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Heading 4">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Connect directly</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] w-full">
        <p className="leading-[20px]">Reach out to members for ideas, feedback, and collaborations.</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[20px] relative w-full">
        <Overlay1 />
        <Heading1 />
        <Container12 />
      </div>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(116,225,252,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Globe">
        <div className="absolute inset-[8.33%]" data-name="Icon">
          <div className="absolute inset-[-4.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.1667 18.1667">
              <path d={svgPaths.p15ba900} id="Icon" stroke="var(--stroke-0, #74E1FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Heading 4">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Find opportunities</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] w-full">
        <p className="leading-[20px]">Discover talents, partnerships, and early-stage teams.</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[20px] relative w-full">
        <Overlay2 />
        <Heading2 />
        <Container13 />
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p794da00} id="Vector" stroke="var(--stroke-0, #74E1FC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(116,225,252,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Svg2 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Heading 4">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">{`Show what you're building`}</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] w-full">
        <p className="leading-[20px]">Create your profile and share your ideas with the network.</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[20px] relative w-full">
        <Overlay3 />
        <Heading3 />
        <Container14 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder1 />
      <BackgroundBorder2 />
      <BackgroundBorder3 />
    </div>
  );
}

function Section1() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full" data-name="Section">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1c] text-[24px] text-center whitespace-nowrap">
        <p className="leading-[32px]">What You Can Do Inside</p>
      </div>
      <Container10 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">We respect your privacy. No spam, ever.</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[12px] whitespace-nowrap">
        <p>
          <span className="[text-decoration-skip-ink:none] decoration-solid leading-[20px] underline">Privacy Policy</span>
          <span className="leading-[20px]">{` - `}</span>
          <span className="[text-decoration-skip-ink:none] decoration-solid leading-[20px] underline">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(136,136,136,0.6)] whitespace-nowrap">
        <p className="leading-[16px]">Vector Network © 2026</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center py-[32px] relative shrink-0 w-full" data-name="Footer">
      <Container15 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full z-[1]" data-name="Main">
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[50px] items-center max-w-[inherit] px-[16px] py-[32px] relative w-full">
          <Group />
          <Section1 />
          <div className="flex flex-col font-['Century_Gothic',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#888] text-[16px] text-center w-[308px]">
            <p className="leading-[26px] whitespace-pre-wrap">
              A curated network of builders and ambitious people.
              <br aria-hidden="true" />
              {` Profiles are reviewed to keep the network high-signal.`}
            </p>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col isolate items-start min-h-[780px] relative shrink-0 w-[390px]" data-name="Container">
      <NavMainNavigation />
      <Main />
    </div>
  );
}

export default function VectorNetworkLanding() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="/">
      <div className="absolute flex inset-[0_0_779.75px_0] items-center justify-center">
        <div className="-scale-y-100 flex-none h-[1141px] w-[390px]">
          <MaskGroup />
        </div>
      </div>
      <Container />
    </div>
  );
}

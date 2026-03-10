import { MemberProfilePageSection } from "@/components/sections/member-profile-page";

type MemberProfilePageProps = {
  params: {
    id: string;
  };
};

export default function MemberProfilePage({ params }: MemberProfilePageProps) {
  return <MemberProfilePageSection memberId={params.id} />;
}

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export default function CampaignLayout({ children }: Props) {
  return children;
}

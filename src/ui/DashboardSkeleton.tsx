import styled, { keyframes } from 'styled-components'

// ── Shimmer ──────────────────────────────────────────────────────────

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`

const Pulse = styled.div<{ $w?: string; $h?: string; $radius?: string }>`
  width: ${({ $w }) => $w || '100%'};
  height: ${({ $h }) => $h || '1rem'};
  border-radius: ${({ $radius }) => $radius || '0.4rem'};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.12) 37%,
    rgba(255, 255, 255, 0.05) 63%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;

  [data-mantine-color-scheme='light'] & {
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.04) 25%,
      rgba(0, 0, 0, 0.1) 37%,
      rgba(0, 0, 0, 0.04) 63%
    );
    background-size: 800px 100%;
  }
`

// ── Layout (mirrors DashBoard.tsx structure) ────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 2rem;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const TabRowSkeleton = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`

const TabPill = styled(Pulse)`
  border-radius: 50px;
`

const StatCardsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(187, 247, 208, 0.24);
  border-radius: 12px;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(20, 83, 45, 0.24);
  }
`

const StatCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`

const GraphCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(187, 247, 208, 0.24);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(20, 83, 45, 0.24);
  }
`

const GraphHeaderSkeleton = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`

const MessageCaption = styled.p`
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.45;
  margin: -0.75rem 0 0;
`

// ── Component ────────────────────────────────────────────────────────

function DashboardSkeleton({ message }: { message?: string }) {
  return (
    <PageWrapper aria-busy="true" aria-label="Loading dashboard">
      <TitleSection>
        <Pulse $w="18rem" $h="2.5rem" $radius="0.6rem" />
        <Pulse $w="24rem" $h="1rem" />
      </TitleSection>

      {message && <MessageCaption>{message}</MessageCaption>}

      <TabRowSkeleton>
        <TabPill $w="7rem" $h="2.75rem" />
        <TabPill $w="7rem" $h="2.75rem" />
        <TabPill $w="7rem" $h="2.75rem" />
        <TabPill $w="7rem" $h="2.75rem" />
      </TabRowSkeleton>

      <StatCardsRow>
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCard key={i}>
            <Pulse $w="28px" $h="28px" $radius="50%" />
            <StatCardInfo>
              <Pulse $w="70%" $h="0.7rem" />
              <Pulse $w="50%" $h="1.4rem" />
            </StatCardInfo>
          </StatCard>
        ))}
      </StatCardsRow>

      <GraphCard>
        <GraphHeaderSkeleton>
          <Pulse $w="16rem" $h="2.5rem" $radius="50px" />
        </GraphHeaderSkeleton>
        <Pulse $h="300px" $radius="12px" />
      </GraphCard>
    </PageWrapper>
  )
}

export default DashboardSkeleton

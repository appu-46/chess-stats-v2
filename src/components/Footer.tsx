import styled from 'styled-components'
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { FaSquareXTwitter } from 'react-icons/fa6'

const StyledFooter = styled.footer`
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  text-align: center;
  opacity: 0.7;

  [data-mantine-color-scheme='light'] & {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    /* Clear the fixed bottom nav bar. */
    padding-bottom: 4.5rem;
  }
`

const FooterContent = styled.div`
  max-width: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
`

const FooterText = styled.span`
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.7;
`

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
`

const SocialLink = styled.a`
  font-size: 1rem;
  transition:
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: var(--brand-soft);
    transform: translateY(-2px);
  }
`

function Footer() {
  return (
    <StyledFooter>
      <FooterContent>
        <SocialLinks>
          <SocialLink
            href="https://github.com/appu-46"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </SocialLink>
          <SocialLink
            href="https://www.instagram.com/git_life/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </SocialLink>
          <SocialLink
            href="https://www.linkedin.com/in/abhishekprajapati/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </SocialLink>
          <SocialLink
            href="https://x.com/ap958461"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSquareXTwitter />
          </SocialLink>
          <FooterText as="span" style={{ fontSize: '0.85rem' }}>
            Abhishek Prajapati
          </FooterText>
        </SocialLinks>
        <FooterText>
          © {new Date().getFullYear()} Chess Stats. All rights reserved.
        </FooterText>
      </FooterContent>
    </StyledFooter>
  )
}

export default Footer

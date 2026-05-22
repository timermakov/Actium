import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionCard } from '../../../src/shared/SectionCard'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme()

// Wrapper component for MUI theme
const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

describe('SectionCard', () => {
    it('renders with title', () => {
        render(
            <Wrapper>
                <SectionCard title="Test Title" description="Test Description">
                    <div>Content</div>
                </SectionCard>
            </Wrapper>
        )

        expect(screen.getByText('Test Title')).toBeDefined()
    })

    it('renders with description', () => {
        render(
            <Wrapper>
                <SectionCard title="Test" description="Test Description">
                    <div>Content</div>
                </SectionCard>
            </Wrapper>
        )

        expect(screen.getByText('Test Description')).toBeDefined()
    })

    it('renders children content', () => {
        render(
            <Wrapper>
                <SectionCard title="Test" description="Desc">
                    <div data-testid="child-content">Child Content</div>
                </SectionCard>
            </Wrapper>
        )

        expect(screen.getByTestId('child-content')).toBeDefined()
    })

    it('renders with actions', () => {
        render(
            <Wrapper>
                <SectionCard title="Test" description="Desc" actions={<button data-testid="action-btn">Action</button>}>
                    <div>Content</div>
                </SectionCard>
            </Wrapper>
        )

        expect(screen.getByTestId('action-btn')).toBeDefined()
    })

    it('renders divider when actions present', () => {
        const { container } = render(
            <Wrapper>
                <SectionCard title="Test" description="Desc" actions={<button>Action</button>}>
                    <div>Content</div>
                </SectionCard>
            </Wrapper>
        )

        expect(container.querySelector('hr')).toBeDefined()
    })

    it('renders divider when showDivider is true', () => {
        const { container } = render(
            <Wrapper>
                <SectionCard title="Test" description="Desc" showDivider={true}>
                    <div>Content</div>
                </SectionCard>
            </Wrapper>
        )

        expect(container.querySelector('hr')).toBeDefined()
    })
})

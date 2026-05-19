---
name: RMD Industrial Core
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#cfc4c5'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#988e90'
  outline-variant: '#4c4546'
  surface-tint: '#c6c6c6'
  primary: '#c6c6c6'
  on-primary: '#303030'
  primary-container: '#000000'
  on-primary-container: '#757575'
  inverse-primary: '#5e5e5e'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c6c6c6'
  on-tertiary: '#303030'
  tertiary-container: '#000000'
  on-tertiary-container: '#757575'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 96px
    fontWeight: '900'
    lineHeight: 100%
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 110%
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 110%
  accent-label:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 100%
    letterSpacing: 0.1em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 160%
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 150%
  button-text:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 100%
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is rooted in the high-stakes world of premium streetwear, blending the aggressive energy of underground culture with the refined precision of luxury fashion. It is designed to evoke a sense of exclusivity, raw power, and technical sophistication.

The aesthetic follows a **High-Contrast / Industrial Minimalism** approach. It utilizes a deep, monochromatic base to allow oversized editorial photography to dominate the visual field. Inspired by tactical gear and brutalist architecture, the interface prioritizes structural integrity, sharp geometry, and a "noir" digital atmosphere. The energy of the brand is punctuated by a "distressed" red, referencing the raw, energetic textures found in the brand's core iconography.

## Colors

This design system is native to **Dark Mode**. The palette is strictly hierarchical:

- **Primary & Neutrals:** The foundation is absolute black (`#000000`), providing a bottomless depth for product photography. Surfaces are tiered using `#1A1A1A` to create subtle separation without breaking the dark aesthetic.
- **Secondary:** Off-white (`#F5F5F5`) is used for primary typography and essential UI icons, ensuring maximum readability against the dark background.
- **Accent:** Vibrant Red (`#FF0000`) is the "heartbeat" of the system. It is reserved exclusively for critical call-to-actions, limited drop indicators, and error states.
- **Texture:** Where possible, apply a subtle film grain or noise overlay to large black surfaces to mirror the "distressed" energy of the reference imagery.

## Typography

Typography functions as a structural element. 
- **Headlines:** Use **Montserrat** in heavy weights (ExtraBold/Black). Tight kerning and high-impact sizing create an editorial feel.
- **Accents/Labels:** **Space Grotesk** provides a technical, industrial edge. Use this for metadata, price tags, and category labels. Always uppercase with generous letter spacing.
- **Body:** **Hanken Grotesk** is chosen for its contemporary, neutral profile, ensuring that long-form copy and product descriptions remain legible and professional.

## Layout & Spacing

The layout utilizes a **12-column Fluid Grid** for desktop and a **4-column Fluid Grid** for mobile. 

The philosophy is "Generous Void": large gaps between sections (`120px+`) focus the user's attention on individual product drops. Layouts should often be asymmetrical to mirror the "grunge" influence, with elements occasionally breaking the grid or overlapping.

- **Margins:** Use wide outer margins (`64px`) on desktop to frame content like a gallery piece.
- **Rhythm:** All spacing is derived from a 4px baseline, but transitions between major sections should feel expansive and unhurried.

## Elevation & Depth

In this design system, depth is achieved through **Tonal Layering** and **Sharp Outlines** rather than traditional shadows.

- **Surface Tiering:** The background is `#000000`. Cards and modals sit on `#1A1A1A`. 
- **Borders:** Use thin, high-contrast borders (`1px solid #333333`) to define shapes. This "Tactile/Industrial" approach avoids the soft look of shadows in favor of a rigid, structural feel.
- **The "Distress" Overlay:** For premium modals or hover states, use a semi-transparent red "distress" texture (sampling from the logo) as a background wash to inject the brand's raw energy into the clean UI.

## Shapes

The shape language is **unapologetically sharp**. 

- **Corners:** 0px border-radius across all buttons, inputs, and cards. This reinforces the industrial and aggressive aesthetic.
- **Icons:** Use thick-stroke, geometric icons with mitred (sharp) corners. Avoid rounded terminals or soft "friendly" iconography.

## Components

- **Buttons:** Primary buttons are solid `#F5F5F5` with `#000000` text. Hover states should trigger a flash of `#FF0000`. No rounded corners.
- **Input Fields:** Bottom-border only or full-outline with `#333333`. Focus state switches the border to `#FF0000`.
- **Cards:** Use "ghost" borders (`1px #333333`). Images within cards should have a slight zoom effect on hover.
- **Status Chips:** Small, rectangular tags with a background of `#1A1A1A` and text in `accent-label` style.
- **Transitions:** Use "Hard-Cuts" or "Fast-Linear" eases. Avoid bouncy or playful spring animations. Transitions should feel like a camera shutter—quick, precise, and mechanical.
- **Product Badges:** Use a distressed red texture background for badges like "SOLD OUT" or "LIMITED DROP," directly referencing the logo's aesthetic.
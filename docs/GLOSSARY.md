# Glossary

This glossary defines key terms, concepts, and acronyms used throughout the Swiss Army Knife (SAK) custom card documentation.

## A

**Accessibility (a11y)**
- The practice of making web content accessible to people with disabilities. SAK aims for WCAG 2.1 AA compliance.

**Animation**
- Visual effects that change over time, such as color transitions, size changes, or movement. SAK supports state-based animations.

**API (Application Programming Interface)**
- A set of protocols and tools for building software applications. SAK provides APIs for tool development and configuration.

**Aspect Ratio**
- The proportional relationship between width and height of a card. SAK supports various aspect ratios like "1/1", "16/9", etc.

**Attribute**
- Additional properties of Home Assistant entities beyond their main state value. Examples include unit_of_measurement, friendly_name, etc.

## B

**Badge Tool**
- A SAK tool that displays small badges with text or numbers, commonly used for notifications and status indicators.

**Bar Chart Tool**
- A SAK tool that creates bar charts showing historical data in rectangular bars.

**Base Tool**
- The abstract base class that all SAK tools inherit from, providing common functionality and structure.

**Bundle Size**
- The total size of the compiled JavaScript file. SAK aims to keep bundle size under 200KB for optimal performance.

**Build System**
- The tools and processes used to compile, optimize, and package the SAK code. Currently uses Vite in the modernization plan.

## C

**Circle Tool**
- A SAK tool that creates circular shapes for indicators, status lights, and progress displays.

**Circular Slider Tool**
- A SAK tool that creates circular sliders for controlling numeric values in a rotary fashion.

**Color Stop**
- A color value associated with a specific state or numeric value. Used to create dynamic color changes based on entity state.

**Config Flow**
- Home Assistant's UI-based configuration system that allows users to configure integrations without editing YAML files.

**Configuration**
- The YAML or UI-based settings that define how a SAK card appears and behaves.

**Custom Element**
- A web component that extends HTML with custom functionality. SAK is implemented as a custom element.

## D

**DAST (Dynamic Application Security Testing)**
- Security testing that examines running applications for vulnerabilities.

**Dependency**
- External libraries or packages that SAK relies on, such as Lit, Home Assistant WebSocket library, etc.

**DevTools**
- Browser developer tools used for debugging, profiling, and inspecting web applications.

**DOM (Document Object Model)**
- The programming interface for HTML and XML documents. SAK manipulates the DOM to render tools and handle interactions.

## E

**Ellipse Tool**
- A SAK tool that creates elliptical shapes for oval indicators and decorative elements.

**End-to-End (E2E) Testing**
- Testing methodology that tests the complete user workflow from start to finish.

**Entity**
- A Home Assistant concept representing a device, service, or piece of information. SAK displays entity states and allows interaction.

**Entity Index**
- A numeric reference (0, 1, 2, etc.) that links tools to specific entities in the entities array.

**Error Boundary**
- A React/component pattern that catches JavaScript errors and displays fallback UI. SAK implements error boundaries for graceful error handling.

## F

**Fire DOM Event**
- A user action that fires custom events to other Home Assistant components or integrations.

**Frontend**
- The user interface layer of Home Assistant that runs in the browser. SAK is a frontend custom card.

## G

**GitHub Actions**
- CI/CD platform used by SAK for automated testing, building, and deployment.

**GUI (Graphical User Interface)**
- Visual interface elements that allow users to interact with software. SAK's modernization includes GUI configuration tools.

## H

**HACS (Home Assistant Community Store)**
- A third-party store for Home Assistant custom components and cards. SAK is distributed through HACS.

**Hass (Home Assistant)**
- The main Home Assistant object that provides access to states, services, and other Home Assistant functionality.

**Horseshoe Tool**
- A SAK tool that creates horseshoe-shaped progress indicators, commonly used for battery levels and circular progress.

**HTML**
- HyperText Markup Language, the standard markup language for web pages. SAK generates HTML for tool rendering.

## I

**Icon Tool**
- A SAK tool that displays icons associated with entities or custom icons.

**i18n (Internationalization)**
- The process of designing software to support multiple languages and regions. SAK's modernization includes i18n support.

**Integration Testing**
- Testing that verifies the interaction between different components or systems.

**Interactive Tool**
- SAK tools that respond to user input, such as switches, sliders, and buttons.

## J

**JavaScript**
- Programming language used to implement SAK's functionality. Modernization includes TypeScript for better type safety.

**JSON**
- JavaScript Object Notation, a data format used for configuration and data exchange.

## L

**Line Tool**
- A SAK tool that creates straight lines for dividers, connections, and decorative elements.

**Lit**
- A lightweight web components library. SAK uses Lit 3.x in the modernization plan.

**Lovelace**
- Home Assistant's dashboard system where SAK cards are displayed and configured.

## M

**Migration**
- The process of updating from one version of SAK to another, including configuration changes and compatibility updates.

**Modernization**
- The comprehensive update plan for SAK that includes technology upgrades, new features, and improved user experience.

**Module**
- A self-contained unit of code that can be imported and used by other parts of the application.

## N

**Name Tool**
- A SAK tool that displays the friendly name of an entity.

**Node.js**
- JavaScript runtime environment used for development tools, testing, and build processes.

**npm**
- Package manager for Node.js used to manage SAK's dependencies and scripts.

## O

**Open Source**
- Software with source code that is freely available and can be modified and distributed.

**Operator**
- Comparison operators used in SAK animations and conditions (==, !=, >, <, >=, <=).

## P

**Performance**
- The speed and efficiency of SAK's rendering, updates, and user interactions.

**Playwright**
- End-to-end testing framework used by SAK for automated browser testing.

**Position**
- The location of tools within a toolset, specified as percentages (0-100%) for X and Y coordinates.

**Pre-release**
- Software versions that are not yet ready for general use, such as alpha, beta, or release candidate versions.

## Q

**Quality Assurance (QA)**
- The process of ensuring software meets quality standards through testing, review, and validation.

## R

**Range Slider Tool**
- A SAK tool that creates horizontal sliders for controlling numeric values.

**Rectangle Tool**
- A SAK tool that creates rectangular shapes for progress bars, backgrounds, and containers.

**Regular Polygon Tool**
- A SAK tool that creates regular polygons (triangles, squares, hexagons, etc.) for geometric indicators.

**Release**
- A version of SAK that is ready for distribution and use by end users.

**Repository**
- A storage location for SAK's source code, documentation, and related files, hosted on GitHub.

## S

**SAST (Static Application Security Testing)**
- Security testing that examines source code for vulnerabilities without executing the program.

**Segmented Arc Tool**
- A SAK tool that creates segmented arcs for multi-state indicators and complex status displays.

**Semantic Versioning (SemVer)**
- A versioning scheme that uses three numbers (MAJOR.MINOR.PATCH) to indicate the type of changes in a release.

**Service**
- Home Assistant's way of calling functions on devices or integrations. SAK can call services through user actions.

**Sparkline Tool**
- A SAK tool that creates sparkline charts showing historical data trends in a compact format.

**State**
- The current value or condition of a Home Assistant entity. SAK displays and responds to entity state changes.

**State Tool**
- A SAK tool that displays the current state value of an entity.

**Switch Tool**
- A SAK tool that creates interactive switches for toggling entities on and off.

## T

**Template**
- SAK's system for reusable card configurations and tool definitions.

**Testing**
- The process of verifying that SAK works correctly through automated and manual testing methods.

**Text Tool**
- A SAK tool that displays static text labels and descriptions.

**Theme**
- A collection of colors, fonts, and styles that define the visual appearance of SAK cards.

**Tool**
- Individual visual elements in SAK that display information or provide interaction, such as circles, text, or sliders.

**Toolset**
- A group of related tools that share positioning and styling within a SAK card.

**TypeScript**
- A programming language that adds type safety to JavaScript. SAK's modernization includes TypeScript implementation.

## U

**Unit Testing**
- Testing individual components or functions in isolation to verify they work correctly.

**User Action**
- Interactive behaviors that respond to user input, such as tap actions, hover effects, and service calls.

**User SVG Tool**
- A SAK tool that allows embedding custom SVG content for unique graphics and icons.

## V

**Version Control**
- The practice of tracking and managing changes to SAK's source code using Git.

**Vite**
- A fast build tool and development server used in SAK's modernization for improved development experience.

**Vitest**
- A fast unit testing framework used by SAK for testing components and utilities.

**Visual Regression Testing**
- Testing that compares visual output to ensure UI changes don't break existing designs.

**Vulnerability**
- A security weakness that could be exploited to compromise SAK's functionality or user data.

## W

**WCAG (Web Content Accessibility Guidelines)**
- International standards for web accessibility. SAK aims for WCAG 2.1 AA compliance.

**WebSocket**
- A communication protocol used by SAK to receive real-time updates from Home Assistant.

**Workflow**
- Automated processes in GitHub Actions that handle testing, building, and deployment of SAK.

## Y

**YAML**
- A human-readable data format used for SAK configuration files. Modernization includes YAML-free configuration options.

## Z

**Zero Configuration**
- The ability to use SAK with minimal or no manual configuration, achieved through smart defaults and UI-based setup.

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)  
**Total Terms**: 100+ defined terms
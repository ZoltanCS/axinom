import { useState } from 'react';

interface HelpTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Basics',
    content: `Welcome to AXINOM! This is a web-based desktop environment that runs entirely in your browser.

• Double-click desktop icons to launch applications
• Use the taskbar to switch between windows
• Right-click on the desktop for quick actions
• Drag window titlebars to move windows
• Use window controls to minimize, maximize, or close windows`,
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'Basics',
    content: `Essential keyboard shortcuts for efficient navigation:

• Alt+Tab - Switch between applications
• Win+E - Open File Manager
• Win+T - Open Terminal
• Win+S - Open Settings
• F1 - Open this Help application
• Ctrl+W - Close current window`,
  },
  {
    id: 'file-management',
    title: 'File Management',
    category: 'Files',
    content: `The File Manager allows you to browse and manage your virtual file system:

• Navigate folders by double-clicking them
• Create new files and folders using the toolbar
• Right-click for context menu options
• Files are persisted in localStorage
• Use the breadcrumb trail to navigate back`,
  },
  {
    id: 'terminal-usage',
    title: 'Using the Terminal',
    category: 'Terminal',
    content: `The Terminal provides command-line access to the system:

Available commands:
• help - Show available commands
• ls - List directory contents
• cd <dir> - Change directory
• cat <file> - Display file contents
• echo <text> - Print text
• clear - Clear the terminal
• date - Show current date/time
• whoami - Show current user`,
  },
  {
    id: 'settings-customization',
    title: 'Settings & Customization',
    category: 'Settings',
    content: `Customize your AXINOM experience:

Appearance:
• Change wallpapers from preset themes
• More customization options coming soon

System:
• Monitor resource usage (RAM, processes)
• Reset file system or user data
• View system information

User Profile:
• Your username is set during initial setup
• Pattern lock secures your session`,
  },
  {
    id: 'applications',
    title: 'Built-in Applications',
    category: 'Apps',
    content: `AXINOM includes several productivity applications:

• Terminal - Command-line interface
• Editor - Text/code editing
• Canvas - Drawing application
• Navigator - Web browser simulator
• Files - File management
• Task Manager - Process monitoring
• Settings - System configuration
• Calculator - Mathematical calculations
• Calendar - Schedule management
• Media Player - Audio playback
• Image Viewer - Photo viewing
• Network - Network settings`,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    category: 'Support',
    content: `Common issues and solutions:

Application not responding:
• Use Task Manager to force quit

Lost files:
• Check if localStorage is cleared
• Files persist across sessions by default

Performance issues:
• Close unused applications
• Check RAM usage in Task Manager

Reset everything:
• Go to Settings > General > Reset User Data
• This will restart the setup process`,
  },
  {
    id: 'about-axinom',
    title: 'About AXINOM',
    category: 'Support',
    content: `AXINOM v2.0 - Web Desktop Environment

Technical Details:
• Kernel: AXI-CORE 2.0
• Built with React 19 + TypeScript
• Styled with Tailwind CSS v4
• Bundled with Vite
• Animations via Framer Motion

Features:
• Full window management
• Virtual file system
• Multi-tasking support
• Persistent storage
• Pattern-based security

© Axinom Systems Corp.`,
  },
];

export function AXI_Help() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(HELP_TOPICS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(HELP_TOPICS.map(t => t.category)))];

  const filteredTopics = HELP_TOPICS.filter(topic => {
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid rgba(148, 163, 184, 0.1)', padding: 16, display: 'flex', flexDirection: 'column' }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 16,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 13,
          }}
        />

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 12px',
                textAlign: 'left' as const,
                background: selectedCategory === cat ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                color: selectedCategory === cat ? '#06b6d4' : '#94a3b8',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              style={{
                width: '100%',
                padding: '10px 12px',
                textAlign: 'left' as const,
                background: selectedTopic?.id === topic.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                color: selectedTopic?.id === topic.id ? '#e2e8f0' : '#94a3b8',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: selectedTopic?.id === topic.id ? 600 : 400,
                transition: 'all 0.15s ease',
                marginBottom: 4,
              }}
            >
              <div style={{ marginBottom: 2 }}>{topic.title}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{topic.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        {selectedTopic ? (
          <>
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px',
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#06b6d4',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 12,
            }}>
              {selectedTopic.category}
            </div>
            
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>{selectedTopic.title}</h1>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 12,
              padding: 24,
              lineHeight: 1.8,
              fontSize: 14,
              whiteSpace: 'pre-wrap',
            }}>
              {selectedTopic.content}
            </div>

            {/* Quick Links */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Related Topics</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {HELP_TOPICS
                  .filter(t => t.id !== selectedTopic.id && t.category === selectedTopic.category)
                  .slice(0, 3)
                  .map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="axi-btn"
                      style={{ fontSize: 12 }}
                    >
                      → {topic.title}
                    </button>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 80, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No topic selected</div>
            <div>Select a topic from the sidebar to view help content</div>
          </div>
        )}
      </div>
    </div>
  );
}

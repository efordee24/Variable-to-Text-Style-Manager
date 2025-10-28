import React from 'react';

export function EmptyState() {
  return (
    <div className="empty-state">
      <h2>No Text Styles Found</h2>
      <p>
        This file doesn't contain any text styles yet. Create some text styles in your Figma file
        and then reload the plugin to get started.
      </p>
    </div>
  );
}

// src/app/api/fork/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { githubToken, templateOwner, templateRepo } = await request.json();

    if (!githubToken || !templateOwner || !templateRepo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fork the repository
    const forkResponse = await fetch(
      `https://api.github.com/repos/${templateOwner}/${templateRepo}/forks`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'YourApp/1.0'
        }
      }
    );

    if (!forkResponse.ok) {
      const error = await forkResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'GitHub API error',
          status: forkResponse.status,
          details: error.message || 'Unknown error'
        },
        { status: forkResponse.status }
      );
    }

    const forkData = await forkResponse.json();
    
    return NextResponse.json({
      success: true,
      forkedUrl: forkData.html_url,
      repoName: forkData.name,
      owner: forkData.owner.login
    });

  } catch (error: any) {
    console.error('Fork error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
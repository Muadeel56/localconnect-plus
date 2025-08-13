# Tools Directory

This directory contains various tools and scripts used for project management and automation.

## Scripts (`./scripts/`)

### GitHub Management Scripts
- **`create_github_issues.sh`** - Creates comprehensive GitHub issues for project milestones
- **`create_labels.sh`** - Sets up GitHub labels for issue categorization  
- **`create_missing_issues.sh`** - Creates any missing issues for project completion

## Usage

All scripts should be run from the project root directory:

```bash
# Example usage
./tools/scripts/create_labels.sh
```

Make sure you have GitHub CLI (`gh`) installed and authenticated before running GitHub-related scripts.

## Adding New Tools

When adding new tools:
1. Place scripts in the appropriate subdirectory
2. Make scripts executable: `chmod +x script_name.sh`
3. Update this README with script descriptions
4. Follow consistent naming conventions 
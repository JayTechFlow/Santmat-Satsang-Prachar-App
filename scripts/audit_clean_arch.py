import os
import re
import json

def check_file(path, layer, root_dir):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    findings = []
    
    # Simple regex for imports (works for both dart and ts)
    # Dart: import 'package:app/features/xyz/repositories/...';
    # TS: import { X } from '@/repositories/...'; or '../../repositories/...'
    
    imports = re.findall(r'(?:import|require)\s+[^;]+;', content)
    
    for imp in imports:
        imp_lower = imp.lower()
        
        target_layer = None
        if 'datasource' in imp_lower:
            target_layer = 'datasource'
        elif 'repository' in imp_lower or 'repositories' in imp_lower:
            target_layer = 'repository'
        elif 'usecase' in imp_lower or 'usecases' in imp_lower or 'use_cases' in imp_lower or 'use_case' in imp_lower:
            target_layer = 'usecase'
        elif 'provider' in imp_lower or 'providers' in imp_lower:
            target_layer = 'provider'
        elif 'presentation' in imp_lower or 'ui' in imp_lower or 'screens' in imp_lower or 'widgets' in imp_lower or 'pages' in imp_lower or 'components' in imp_lower:
            target_layer = 'presentation'
            
        if not target_layer:
            continue
            
        # Check rules
        # Presentation -> Provider -> UseCase -> Repository -> Datasource
        
        violation = None
        severity = None
        minimal_fix = None
        
        if layer == 'presentation':
            if target_layer in ['usecase', 'repository', 'datasource']:
                violation = f'Presentation bypassing Provider to call {target_layer}'
                severity = 'High'
                minimal_fix = f'Inject {target_layer} into a Provider and have Presentation call the Provider.'
        elif layer == 'provider':
            if target_layer in ['repository', 'datasource']:
                violation = f'Provider bypassing UseCase to call {target_layer}'
                severity = 'High' if target_layer == 'repository' else 'Critical'
                minimal_fix = f'Create a UseCase that wraps the {target_layer} call, and have Provider call the UseCase.'
            elif target_layer == 'presentation':
                violation = f'Cross-layer dependency: Provider depends on Presentation'
                severity = 'Medium'
                minimal_fix = 'Move Presentation logic out of Provider (e.g. handle navigation/UI state in UI layer or use a navigation service).'
        elif layer == 'usecase':
            if target_layer == 'datasource':
                violation = f'UseCase bypassing Repository to call Datasource'
                severity = 'High'
                minimal_fix = 'Wrap Datasource in a Repository interface and have UseCase depend on the Repository.'
            elif target_layer in ['presentation', 'provider']:
                violation = f'Cross-layer dependency: UseCase depends on {target_layer}'
                severity = 'Critical'
                minimal_fix = f'Remove {target_layer} dependency from UseCase. UseCases should only contain pure business logic.'
        elif layer == 'repository':
            if target_layer in ['presentation', 'provider', 'usecase']:
                violation = f'Cross-layer dependency: Repository depends on {target_layer}'
                severity = 'Critical'
                minimal_fix = f'Remove {target_layer} dependency from Repository. Repositories should only depend on Datasources.'
        elif layer == 'datasource':
            if target_layer in ['presentation', 'provider', 'usecase', 'repository']:
                violation = f'Cross-layer dependency: Datasource depends on {target_layer}'
                severity = 'Critical'
                minimal_fix = f'Remove {target_layer} dependency from Datasource. Datasources should only interact with external APIs/DBs.'
                
        if violation:
            findings.append({
                'file': path,
                'violation': violation,
                'severity': severity,
                'minimal_fix': minimal_fix,
                'import': imp.strip()
            })
            
    return findings

def get_layer(path):
    p = path.lower()
    if 'datasource' in p: return 'datasource'
    if 'repository' in p or 'repositories' in p: return 'repository'
    if 'usecase' in p or 'use_cases' in p or 'usecases' in p: return 'usecase'
    if 'provider' in p or 'providers' in p or 'state' in p or 'controllers' in p: return 'provider'
    if 'presentation' in p or 'ui' in p or 'screens' in p or 'widgets' in p or 'pages' in p or 'components' in p: return 'presentation'
    return None

def main():
    roots = ['/Users/jaymac/Documents/Santmat-Satsang-Prachar/mobile/app/lib', '/Users/jaymac/Documents/Santmat-Satsang-Prachar/admin-panel/src']
    
    all_findings = []
    
    for root in roots:
        if not os.path.exists(root): continue
        for dirpath, dirnames, filenames in os.walk(root):
            for file in filenames:
                if not file.endswith(('.dart', '.ts', '.tsx')): continue
                path = os.path.join(dirpath, file)
                layer = get_layer(path)
                if layer:
                    findings = check_file(path, layer, root)
                    all_findings.extend(findings)
                    
    with open('/Users/jaymac/Documents/Santmat-Satsang-Prachar/clean_arch_findings.json', 'w') as f:
        json.dump(all_findings, f, indent=2)

if __name__ == '__main__':
    main()
